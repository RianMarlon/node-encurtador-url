import 'reflect-metadata';
import { container } from '@/shared/infra/di';

import fastify from 'fastify';
import cors from '@fastify/cors';

import { urlShortenerRoutes } from '@/modules/url-shortener/infra/http/fastify/url-shortener.routes';
import { userRoutes } from '@/modules/user/infra/http/fastify/user.routes';
import { PrismaClient } from '@prisma/client/extension';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { authRoutes } from '@/modules/auth/infra/http/fastify/routes/auth.routes';

export const app = fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.register(urlShortenerRoutes);
app.register(userRoutes);
app.register(authRoutes);

app.setErrorHandler((error, request, reply) => {
  if (error instanceof NotificationError) {
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

  app.log.error(error);
  reply.status(500).send({ error: error.message });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const start = async () => {
  try {
    const prismaClient = container.resolve<PrismaClient>('PrismaClient');
    await prismaClient.$connect();

    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server is running on port ${PORT}`);
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
