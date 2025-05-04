import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { LoginUseCase } from '@/modules/auth/application/usecases/login/login.usecase';

interface LoginRequest {
  email: string;
  password: string;
}

export class LoginController {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { email, password } = request.body as LoginRequest;

    const loginUseCase = container.resolve(LoginUseCase);

    const result = await loginUseCase.execute({
      email,
      password,
    });

    return reply.status(200).send(result);
  }
}
