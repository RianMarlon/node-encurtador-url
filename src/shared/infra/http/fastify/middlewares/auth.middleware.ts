import { container } from 'tsyringe';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtProvider } from '@/shared/providers/jwt/interfaces/jwt-provider.interface';

export class AuthMiddleware {
  private readonly jwtProvider: JwtProvider = container.resolve('JwtProvider');

  async optionalAuth(request: FastifyRequest): Promise<void> {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    const [, token] = authHeader.split(' ');

    try {
      const { sub: userId } = await this.jwtProvider.verify(token);

      request.user = {
        id: userId,
      };
    } catch {}
  }

  async requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ errors: [{ message: 'Token not provided' }] });
    }

    const [, token] = authHeader.split(' ');

    try {
      const { sub: userId } = await this.jwtProvider.verify(token);

      request.user = {
        id: userId,
      };
    } catch {
      return reply.status(401).send({ errors: [{ message: 'Invalid token' }] });
    }
  }
}
