import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { CreateUserUseCase } from '@/modules/user/application/usecases/create-user/create-user.usecase';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export class CreateUserController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
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
