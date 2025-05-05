import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { UpdateOriginalUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/update-original-url-by-url-key/update-original-url-by-url-key.usecase';

interface UpdateOriginalUrlByUrlKeyParams {
  urlKey: string;
}

interface UpdateOriginalUrlByUrlKeyBody {
  originalUrl: string;
}

export class UpdateOriginalUrlByUrlKeyController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { urlKey } = request.params as UpdateOriginalUrlByUrlKeyParams;
    const { originalUrl } = request.body as UpdateOriginalUrlByUrlKeyBody;
    const userId = request.user!.id;

    const updateOriginalUrlByUrlKeyUseCase = container.resolve(UpdateOriginalUrlByUrlKeyUseCase);

    const result = await updateOriginalUrlByUrlKeyUseCase.execute({
      urlKey,
      originalUrl,
      userId,
    });

    return reply.status(200).send(result);
  }
}
