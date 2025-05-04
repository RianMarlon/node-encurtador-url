import { FastifyInstance } from 'fastify';

import { LoginController } from '../controllers/login.controller';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const loginController = new LoginController();

  app.post('/login', loginController.handle);
}
