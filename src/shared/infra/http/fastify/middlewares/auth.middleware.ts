import { container } from 'tsyringe';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtProvider } from '@/shared/domain/providers/jwt-provider.interface';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

export class AuthMiddleware {
  private readonly jwtProvider: JwtProvider = container.resolve('JwtProvider');
  private readonly logger: LoggerProvider = container.resolve('LoggerProvider');

  async optionalAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.debug('optionalAuth: No Authorization header found, skipping authentication.');
      return;
    }

    const [, token] = authHeader.split(' ');

    if (token) {
      try {
        this.logger.debug('optionalAuth: Token found, verifying...');
        const { sub: userId } = await this.jwtProvider.verify(token);

        request.user = {
          id: userId as string,
        };
        this.logger.debug(`optionalAuth: Token verified successfully. User ID: ${userId}`);
      } catch (error) {
        this.logger.warn(`optionalAuth: Invalid token provided - ${JSON.stringify(error)}`);
        return reply.status(401).send({ errors: [{ message: 'Invalid token' }] });
      }
    }
  }

  async requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.debug('requireAuth: No Authorization header provided.');
      return reply.status(401).send({ errors: [{ message: 'Token not provided' }] });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      this.logger.debug('requireAuth: Bearer token missing after split.');
      return reply.status(401).send({ errors: [{ message: 'Token not provided' }] });
    }

    try {
      this.logger.debug('requireAuth: Token found, verifying...');
      const { sub: userId } = await this.jwtProvider.verify(token);

      request.user = {
        id: userId as string,
      };
      this.logger.debug(`requireAuth: Token verified successfully. User ID: ${userId}`);
    } catch (error) {
      this.logger.warn(`requireAuth: Invalid token provided - ${JSON.stringify(error)}`);
      return reply.status(401).send({ errors: [{ message: 'Invalid token' }] });
    }
  }
}
