import { container } from 'tsyringe';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserFacade } from '@/modules/user/facade/user.facade';

export class CheckAuthenticateUserMiddleware {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.user || !request.user.id) {
      return;
    }

    const userId = request.user.id;

    try {
      const userFacade = container.resolve<UserFacade>('UserFacade');
      const user = await userFacade.findById({ id: userId });

      if (!user) {
        return reply.status(401).send({ errors: [{ message: 'User not found' }] });
      }
    } catch (error) {
      console.error('Error verifying user authentication:', error);
      return reply.status(500).send({ errors: [{ message: 'Internal server error' }] });
    }
  }
}
