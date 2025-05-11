import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import * as yup from 'yup';

import { LoginUseCase } from '@/modules/auth/application/usecases/login/login.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

interface LoginRequest {
  email: string;
  password: string;
}

export class LoginController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const logger = container.resolve<LoggerProvider>('LoggerProvider');
    logger.debug(
      `Login - Request body (without the password): ${request.body ? JSON.stringify({ email: (request.body as LoginRequest)?.email }) : 'null'}`,
    );

    const schema = yup.object().shape({
      email: yup
        .string()
        .email('Email must be a valid email')
        .required('Email is required')
        .max(255, 'Email must be at most 255 characters'),
      password: yup
        .string()
        .required('Password is required')
        .max(255, 'Password must be at most 255 characters'),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (err: any) {
      const notification = new NotificationError();

      err.inner.forEach((validationError: yup.ValidationError) => {
        notification.addError({
          message: validationError.message,
          code: 'BAD_REQUEST',
          field: validationError.path,
        });
      });

      throw notification;
    }

    const { email, password } = request.body as LoginRequest;

    const loginUseCase = container.resolve(LoginUseCase);

    const result = await loginUseCase.execute({
      email,
      password,
    });

    return reply.status(200).send(result);
  }
}
