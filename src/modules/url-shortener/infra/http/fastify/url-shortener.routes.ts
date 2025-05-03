import { FastifyInstance } from 'fastify';

import { CreateShortUrlController } from './controllers/create-short-url.controller';
import { ResolveShortUrlController } from './controllers/resolve-short-url.controller';

export async function urlShortenerRoutes(app: FastifyInstance): Promise<void> {
  const createShortUrlController = new CreateShortUrlController();
  const resolveShortUrlController = new ResolveShortUrlController();

  app.post('/urls', (request, reply) => createShortUrlController.handle(request, reply));
  app.get('/:urlKey', (request, reply) => resolveShortUrlController.handle(request, reply));
}
