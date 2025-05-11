import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import * as yup from 'yup';

import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

interface ResolveShortUrlParams {
  urlKey: string;
}

export class ResolveShortUrlController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const logger = container.resolve<LoggerProvider>('LoggerProvider');
    logger.debug(`Resolving short URL - Request params ${JSON.stringify(request.params)}`);

    const schema = yup.object().shape({
      urlKey: yup.string().required('The urlKey parameter is required'),
    });

    try {
      schema.validateSync(
        {
          urlKey: (request.params as ResolveShortUrlParams).urlKey,
        },
        { abortEarly: false },
      );
    } catch (err: any) {
      const notification = new NotificationError();

      err.inner.forEach((validationError: yup.ValidationError) => {
        notification.addError({
          message: validationError.message,
          code: 'BAD_REQUEST',
          context: 'UrlShortener',
          field: validationError.path,
        });
      });

      throw notification;
    }

    const { urlKey } = request.params as ResolveShortUrlParams;

    const resolveShortUrlUseCase = container.resolve(ResolveShortUrlUseCase);

    const { originalUrl } = await resolveShortUrlUseCase.execute({
      urlKey,
    });

    return reply.redirect(originalUrl);
  }
}
