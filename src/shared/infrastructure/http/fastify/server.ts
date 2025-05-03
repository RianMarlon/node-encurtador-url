import 'reflect-metadata';

import '@/shared/infrastructure/di';

import fastify from 'fastify';
import cors from '@fastify/cors';

import { urlShortenerRoutes } from '@/modules/url-shortener/infra/http/fastify/url-shortener.routes';

export const app = fastify({});

app.register(cors, {
  origin: true,
});

app.register(urlShortenerRoutes);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const start = async () => {
  try {
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
