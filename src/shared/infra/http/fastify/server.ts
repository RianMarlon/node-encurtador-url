import 'reflect-metadata';
import { container } from '@/shared/infra/di';
import { join } from 'path';
import { readFileSync } from 'fs';

import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { urlShortenerRoutes } from '@/modules/url-shortener/infra/http/fastify/url-shortener.routes';
import { userRoutes } from '@/modules/user/infra/http/fastify/user.routes';
import { PrismaClient } from '@prisma/client/extension';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { authRoutes } from '@/modules/auth/infra/http/fastify/routes/auth.routes';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';
import { TraceMiddleware } from './middlewares/trace.middleware';

export const app = fastify();

// Load OpenAPI documentation from file
const documentationPath = join(process.cwd(), 'documentation.json');
const swaggerDocument = JSON.parse(readFileSync(documentationPath, 'utf8'));
const traceMiddleware = new TraceMiddleware();

// Register Swagger with OpenAPI document
app.register(swagger, {
  mode: 'static',
  specification: {
    document: swaggerDocument,
  },
});

// Register Swagger UI
app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
});

app.register(cors, {
  origin: true,
});

app.register(urlShortenerRoutes);
app.register(userRoutes);
app.register(authRoutes);

app.addHook('onRequest', traceMiddleware.handle);

app.setErrorHandler((error, request, reply) => {
  const logger = container.resolve<LoggerProvider>('LoggerProvider');

  if (error instanceof NotificationError) {
    logger.warn(`Validation error: ${JSON.stringify(error.toJSON())}`);

    const codeToStatusCode = {
      BAD_REQUEST: 400,
      NOT_FOUND: 404,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      TOO_MANY_REQUESTS: 429,
    };
    const errors = error.getErrors();
    const statusCode = codeToStatusCode[errors[0].code];

    reply.status(statusCode).send({
      errors: errors.map((error) => ({
        message: error.message,
        field: error.field,
      })),
    });

    return;
  }

  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    logger.error(`Syntax error: ${JSON.stringify(error)}`);

    reply.status(400).send({
      errors: [
        {
          message: 'Invalid JSON payload',
        },
      ],
    });

    return;
  }

  logger.error(`Unexpected error: ${JSON.stringify(error)}`);
  reply.status(500).send({ errors: [{ message: 'Internal Server Error' }] });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const start = async () => {
  try {
    const prismaClient = container.resolve<PrismaClient>('PrismaClient');
    await prismaClient.$connect();

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running on port ${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;

for (const signal of signals) {
  process.on(signal, async () => {
    app.log.info(`${signal} signal received, closing HTTP server...`);

    try {
      const prismaClient = container.resolve<PrismaClient>('PrismaClient');
      await prismaClient.$disconnect();

      await app.close();
      app.log.info('HTTP server closed');
      process.exit(0);
    } catch (err) {
      app.log.error('Error closing HTTP server:', err);
      process.exit(1);
    }
  });
}

start();
