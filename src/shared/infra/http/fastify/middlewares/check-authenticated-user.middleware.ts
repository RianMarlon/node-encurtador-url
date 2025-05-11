import { container } from 'tsyringe';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserFacade } from '@/modules/user/facade/user.facade';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

export class CheckAuthenticateUserMiddleware {
  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const logger = container.resolve<LoggerProvider>('LoggerProvider');

    if (!request.user || !request.user.id) {
      logger.debug('No authenticated user found on the request.');
      return;
    }

    const userId = request.user.id;
    logger.debug(`Verifying user with ID ${userId}`);

    try {
      const userFacade = container.resolve<UserFacade>('UserFacade');
      const user = await userFacade.findById({ id: userId });

      if (!user) {
        logger.warn(`User with ID ${userId} not found.`);
        return reply.status(401).send({ errors: [{ message: 'User not found' }] });
      }

      logger.debug(`User with ID ${userId} successfully verified.`);
    } catch (error) {
      logger.warn(`Error verifying user authentication - ${JSON.stringify(error)}`);
      return reply.status(500).send({ errors: [{ message: 'Internal server error' }] });
    }
  }
}
