import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import * as yup from 'yup';

import { DeleteShortUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/delete-short-url-by-url-key/delete-short-url-by-url-key.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { UUID_V7_REGEX } from '@/shared/utils/regex/uuid';

interface DeleteShortUrlByUrlKeyParams {
  urlKey: string;
}

export class DeleteShortUrlByUrlKeyController {
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
          urlKey: (request.params as DeleteShortUrlByUrlKeyParams).urlKey,
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
