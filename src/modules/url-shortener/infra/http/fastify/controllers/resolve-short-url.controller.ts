import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';

interface ResolveShortUrlParams {
  urlKey: string;
}

export class ResolveShortUrlController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { urlKey } = request.params as ResolveShortUrlParams;

    const resolveShortUrlUseCase = container.resolve(ResolveShortUrlUseCase);

    const { originalUrl } = await resolveShortUrlUseCase.execute({
      urlKey,
    });

    return reply.redirect(originalUrl);
  }
}
