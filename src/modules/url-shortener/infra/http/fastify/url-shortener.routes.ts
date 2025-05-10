import { FastifyInstance } from 'fastify';

import { CreateShortUrlController } from './controllers/create-short-url.controller';
import { ResolveShortUrlController } from './controllers/resolve-short-url.controller';
import { ListShortenedUrlsByUserIdController } from './controllers/list-shortened-urls-by-user-id.controller';
import { UpdateOriginalUrlByUrlKeyController } from './controllers/update-original-url-by-url-key.controller';
import { DeleteShortUrlByUrlKeyController } from './controllers/delete-short-url-by-url-key.controller';
import { AuthMiddleware } from '@/shared/infra/http/fastify/middlewares/auth.middleware';
import { CheckAuthenticateUserMiddleware } from '@/shared/infra/http/fastify/middlewares/check-authenticated-user.middleware';

export async function urlShortenerRoutes(app: FastifyInstance): Promise<void> {
  const createShortUrlController = new CreateShortUrlController();
  const resolveShortUrlController = new ResolveShortUrlController();
  const listShortenedUrlsByUserIdController = new ListShortenedUrlsByUserIdController();
  const updateOriginalUrlByUrlKeyController = new UpdateOriginalUrlByUrlKeyController();
  const deleteShortUrlByUrlKeyController = new DeleteShortUrlByUrlKeyController();
  const authMiddleware = new AuthMiddleware();
  const checkAuthenticatedUserMiddleware = new CheckAuthenticateUserMiddleware();

  app.post(
    '/urls',
    {
      preHandler: async (request, reply) => {
        await authMiddleware.optionalAuth(request, reply);
        await checkAuthenticatedUserMiddleware.handle(request, reply);
      },
    },
    (request, reply) => createShortUrlController.handle(request, reply),
  );

  app.get(
    '/urls',
    {
      preHandler: async (request, reply) => {
        await authMiddleware.optionalAuth(request, reply);
        await checkAuthenticatedUserMiddleware.handle(request, reply);
      },
    },
    (request, reply) => listShortenedUrlsByUserIdController.handle(request, reply),
  );

  app.patch(
    '/urls/:urlKey',
    {
      preHandler: async (request, reply) => {
        await authMiddleware.optionalAuth(request, reply);
        await checkAuthenticatedUserMiddleware.handle(request, reply);
      },
    },
    (request, reply) => updateOriginalUrlByUrlKeyController.handle(request, reply),
  );

  app.delete(
    '/urls/:urlKey',
    {
      preHandler: async (request, reply) => {
        await authMiddleware.optionalAuth(request, reply);
        await checkAuthenticatedUserMiddleware.handle(request, reply);
      },
    },
    (request, reply) => deleteShortUrlByUrlKeyController.handle(request, reply),
  );

  app.get('/:urlKey', (request, reply) => resolveShortUrlController.handle(request, reply));
}
