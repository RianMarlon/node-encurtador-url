import 'reflect-metadata';
import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from 'tsyringe';
import { AuthMiddleware } from '@/shared/infra/http/fastify/middlewares/auth.middleware';
import { JwtProvider } from '@/shared/domain/providers/jwt-provider.interface';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  let mockJwtProvider: jest.Mocked<JwtProvider>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJwtProvider = {
      generate: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    } as jest.Mocked<JwtProvider>;

    mockLoggerProvider = {
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<LoggerProvider>;

    container.registerInstance('LoggerProvider', mockLoggerProvider);
    container.registerInstance('JwtProvider', mockJwtProvider);

    authMiddleware = new AuthMiddleware();

    mockRequest = {
      headers: {},
      user: undefined,
    } as unknown as FastifyRequest;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as FastifyReply;
  });

  describe('optionalAuth', () => {
    it('should do nothing when authorization header is not provided', async () => {
      mockRequest.headers = {};

      await authMiddleware.optionalAuth(mockRequest, mockReply);

      expect(mockJwtProvider.verify).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should set user ID in request when token is valid', async () => {
      const userId = 'user-123';
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockJwtProvider.verify.mockResolvedValueOnce({
        sub: userId,
        name: 'Test User',
        email: 'test@example.com',
      });

      await authMiddleware.optionalAuth(mockRequest, mockReply);

      expect(mockJwtProvider.verify).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual({ id: userId });
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockJwtProvider.verify.mockRejectedValueOnce(new Error('Invalid token'));

      await authMiddleware.optionalAuth(mockRequest, mockReply);

      expect(mockJwtProvider.verify).toHaveBeenCalledWith('invalid-token');
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        errors: [{ message: 'Invalid token' }],
      });
      expect(mockRequest.user).toBeUndefined();
    });

    it('should handle malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'malformed-header',
      };

      await authMiddleware.optionalAuth(mockRequest, mockReply);

      expect(mockJwtProvider.verify).not.toHaveBeenCalled();
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should return 401 when authorization header is not provided', async () => {
      mockRequest.headers = {};

      await authMiddleware.requireAuth(mockRequest, mockReply);

      expect(mockJwtProvider.verify).not.toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        errors: [{ message: 'Token not provided' }],
      });
      expect(mockRequest.user).toBeUndefined();
    });

    it('should set user ID in request when token is valid', async () => {
      const userId = 'user-123';
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockJwtProvider.verify.mockResolvedValueOnce({
        sub: userId,
        name: 'Test User',
        email: 'test@example.com',
      });

      await authMiddleware.requireAuth(mockRequest, mockReply);

      expect(mockJwtProvider.verify).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual({ id: userId });
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockJwtProvider.verify.mockRejectedValueOnce(new Error('Invalid token'));

      await authMiddleware.requireAuth(mockRequest, mockReply);

      expect(mockJwtProvider.verify).toHaveBeenCalledWith('invalid-token');
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        errors: [{ message: 'Invalid token' }],
      });
      expect(mockRequest.user).toBeUndefined();
    });

    it('should handle malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'malformed-header',
      };

      await authMiddleware.requireAuth(mockRequest, mockReply);

      expect(mockJwtProvider.verify).not.toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        errors: [{ message: 'Token not provided' }],
      });
    });
  });
});
