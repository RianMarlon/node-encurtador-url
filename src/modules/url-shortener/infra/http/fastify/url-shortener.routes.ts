import { FastifyInstance } from 'fastify';

import { CreateShortUrlController } from './controllers/create-short-url.controller';
import { ResolveShortUrlController } from './controllers/resolve-short-url.controller';
import { ListShortenedUrlsByUserIdController } from './controllers/list-shortened-urls-by-user-id.controller';
import { UpdateOriginalUrlByUrlKeyController } from './controllers/update-original-url-by-url-key.controller';
import { DeleteShortUrlByUrlKeyController } from './controllers/delete-short-url-by-url-key.controller';
import { AuthMiddleware } from '@/shared/infra/http/fastify/middlewares/auth.middleware';

export async function urlShortenerRoutes(app: FastifyInstance): Promise<void> {
  const createShortUrlController = new CreateShortUrlController();
  const resolveShortUrlController = new ResolveShortUrlController();
  const listShortenedUrlsByUserIdController = new ListShortenedUrlsByUserIdController();
  const updateOriginalUrlByUrlKeyController = new UpdateOriginalUrlByUrlKeyController();
  const deleteShortUrlByUrlKeyController = new DeleteShortUrlByUrlKeyController();
  const authMiddleware = new AuthMiddleware();

  app.post(
    '/urls',
    {
      preHandler: (request) => authMiddleware.optionalAuth(request),
    },
    (request, reply) => createShortUrlController.handle(request, reply),
  );

  app.get(
    '/urls',
    {
      preHandler: (request, reply) => authMiddleware.requireAuth(request, reply),
    },
    (request, reply) => listShortenedUrlsByUserIdController.handle(request, reply),
  );

  app.patch(
    '/urls/:urlKey',
    {
      preHandler: (request, reply) => authMiddleware.requireAuth(request, reply),
    },
    (request, reply) => updateOriginalUrlByUrlKeyController.handle(request, reply),
  );

  app.delete(
    '/urls/:urlKey',
    {
      preHandler: (request, reply) => authMiddleware.requireAuth(request, reply),
    },
    (request, reply) => deleteShortUrlByUrlKeyController.handle(request, reply),
  );

  app.get('/:urlKey', (request, reply) => resolveShortUrlController.handle(request, reply));
}
