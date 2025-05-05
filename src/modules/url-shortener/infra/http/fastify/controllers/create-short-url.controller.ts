import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';

interface CreateShortUrlRequest {
  originalUrl: string;
}

export class CreateShortUrlController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { originalUrl } = request.body as CreateShortUrlRequest;

    const createShortUrlUseCase = container.resolve(CreateShortUrlUseCase);

    const result = await createShortUrlUseCase.execute({
      originalUrl,
      userId: request.user?.id,
    });

    return reply.status(201).send(result);
  }
}
