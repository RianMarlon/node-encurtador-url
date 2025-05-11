import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import * as yup from 'yup';

import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

interface CreateShortUrlRequest {
  originalUrl: string;
}

export class CreateShortUrlController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const logger = container.resolve<LoggerProvider>('LoggerProvider');
    logger.debug(`Creating a short URL - Request body: ${JSON.stringify(request.body)}`);

    const schema = yup.object().shape({
      originalUrl: yup
        .string()
        .url('Original URL must be a valid URL')
        .required('Original URL is required'),
    });

    try {
      schema.validateSync(request.body, { abortEarly: false });
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

    const { originalUrl } = request.body as CreateShortUrlRequest;

    const createShortUrlUseCase = container.resolve(CreateShortUrlUseCase);

    const result = await createShortUrlUseCase.execute({
      originalUrl,
      userId: request.user?.id,
    });

    return reply.status(201).send(result);
  }
}
