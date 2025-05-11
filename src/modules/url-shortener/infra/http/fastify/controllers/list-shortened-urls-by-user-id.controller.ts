import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { ListShortenedUrlsByUserIdUseCase } from '@/modules/url-shortener/application/usecases/list-shortened-urls-by-user-id/list-shortened-urls-by-user-id.usecase';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

export class ListShortenedUrlsByUserIdController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const logger = container.resolve<LoggerProvider>('LoggerProvider');
    logger.debug(`Listing all shortened URLs for user with ID ${request.user!.id}`);
    const listShortenedUrlsByUserIdUseCase = container.resolve(ListShortenedUrlsByUserIdUseCase);

    const result = await listShortenedUrlsByUserIdUseCase.execute({
      userId: request.user!.id,
    });

    return reply.status(200).send(result);
  }
}
