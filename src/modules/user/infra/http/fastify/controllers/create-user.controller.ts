import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import * as yup from 'yup';

import { CreateUserUseCase } from '@/modules/user/application/usecases/create-user/create-user.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export class CreateUserController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const schema = yup.object().shape({
      name: yup
        .string()
        .required('Name is required')
        .max(100, 'Name must be at most 100 characters'),
      email: yup
        .string()
        .email('Email must be a valid email')
        .required('Email is required')
        .max(255, 'Email must be at most 255 characters'),
      password: yup
        .string()
        .required('Password is required')
        .max(30, 'Password must be at most 30 characters')
        .min(8, 'Password must be at least 8 characters')
        .test('has-uppercase', 'Password must contain at least one uppercase letter', (value) =>
          /[A-Z]/.test(value),
        )
        .test('has-lowercase', 'Password must contain at least one lowercase letter', (value) =>
          /[a-z]/.test(value),
        )
        .test('has-number', 'Password must contain at least one number', (value) =>
          /\d/.test(value),
        )
        .test('has-special-char', 'Password must contain at least one special character', (value) =>
          /[@$!%*?&#()[\]{}^~\-_=+<>.,:;|\\\/]/.test(value),
        ),
    });

    try {
      schema.validateSync(request.body, { abortEarly: false });
    } catch (err: any) {
      const notification = new NotificationError();
      err.inner.forEach((validationError: yup.ValidationError) => {
        notification.addError({
          message: validationError.message,
          code: 'BAD_REQUEST',
          context: 'User',
          field: validationError.path,
        });
      });

      throw notification;
    }

    const { name, email, password } = request.body as CreateUserRequest;

    const createUserUseCase = container.resolve(CreateUserUseCase);

    const result = await createUserUseCase.execute({
      name,
      email,
      password,
    });

    return reply.status(201).send(result);
  }
}
