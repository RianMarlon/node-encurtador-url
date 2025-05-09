import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import * as yup from 'yup';

import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';
import { UUID_V7_REGEX } from '@/shared/utils/regex/uuid';
import { NotificationError } from '@/shared/domain/errors/notification-error';

interface ResolveShortUrlParams {
  urlKey: string;
}

export class ResolveShortUrlController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const schema = yup.object().shape({
      urlKey: yup
        .string()
        .required('The urlKey parameter is required')
        .matches(UUID_V7_REGEX, 'The urlKey must be a valid UUID v7'),
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
