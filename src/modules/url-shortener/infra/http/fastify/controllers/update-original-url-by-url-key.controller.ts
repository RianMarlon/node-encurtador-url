import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import * as yup from 'yup';

import { UpdateOriginalUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/update-original-url-by-url-key/update-original-url-by-url-key.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';

interface UpdateOriginalUrlByUrlKeyParams {
  urlKey: string;
}

interface UpdateOriginalUrlByUrlKeyBody {
  originalUrl: string;
}

export class UpdateOriginalUrlByUrlKeyController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const schema = yup.object().shape({
      originalUrl: yup
        .string()
        .url('Original URL must be a valid URL')
        .required('Original URL is required'),
      urlKey: yup.string().required('The urlKey parameter is required'),
    });

    try {
      schema.validateSync(
        {
          originalUrl: (request.body as UpdateOriginalUrlByUrlKeyBody).originalUrl,
          urlKey: (request.params as UpdateOriginalUrlByUrlKeyParams).urlKey,
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
