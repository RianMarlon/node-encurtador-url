import { FastifyInstance } from 'fastify';

import { CreateUserController } from './controllers/create-user.controller';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const createUserController = new CreateUserController();

  app.post('/users', (request, reply) => createUserController.handle(request, reply));
}
