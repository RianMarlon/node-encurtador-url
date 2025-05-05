import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { DeleteShortUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/delete-short-url-by-url-key/delete-short-url-by-url-key.usecase';

interface DeleteShortUrlByUrlKeyParams {
  urlKey: string;
}

export class DeleteShortUrlByUrlKeyController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { urlKey } = request.params as DeleteShortUrlByUrlKeyParams;
    const userId = request.user!.id;

    const deleteShortUrlByUrlKeyUseCase = container.resolve(DeleteShortUrlByUrlKeyUseCase);

    await deleteShortUrlByUrlKeyUseCase.execute({
      urlKey,
      userId,
    });

    return reply.status(204).send();
  }
}
