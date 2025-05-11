import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { LoginController } from '@/modules/auth/infra/http/fastify/controllers/login.controller';
import { LoginUseCase } from '@/modules/auth/application/usecases/login/login.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

jest.mock('@/modules/auth/application/usecases/login/login.usecase');
jest.mock('@/shared/infra/providers/logger/pino-logger-provider');

describe('LoginController', () => {
  let loginController: LoginController;
  let mockLoginUseCase: jest.Mocked<LoginUseCase>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;

  const mockRequest = {
    body: {
      email: 'test@example.com',
      password: 'password123',
    },
  } as unknown as FastifyRequest;

  const mockReply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLoginUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<LoginUseCase>;

    mockLoggerProvider = {
      debug: jest.fn(),
    } as unknown as jest.Mocked<LoggerProvider>;

    container.registerInstance('LoggerProvider', mockLoggerProvider);
    container.registerInstance(LoginUseCase, mockLoginUseCase);

    loginController = new LoginController();
  });

  it('should return 200 status code and access token on successful login', async () => {
    const mockAccessToken = 'mock.jwt.token';
    mockLoginUseCase.execute.mockResolvedValueOnce({ accessToken: mockAccessToken });

    await loginController.handle(mockRequest, mockReply);

    expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ accessToken: mockAccessToken });
  });

  it('should pass request body to login use case', async () => {
    const customEmail = 'custom@example.com';
    const customPassword = 'custom_password';

    const customRequest = {
      body: {
        email: customEmail,
        password: customPassword,
      },
    } as unknown as FastifyRequest;

    mockLoginUseCase.execute.mockResolvedValueOnce({ accessToken: 'token' });

    await loginController.handle(customRequest, mockReply);

    expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
      email: customEmail,
      password: customPassword,
    });
  });

  it('should throw NotificationError when email is missing', async () => {
    const request = {
      body: {
        password: 'df24024if',
      },
    } as unknown as FastifyRequest;

    try {
      await loginController.handle(request, mockReply);
    } catch (error) {
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Email is required',
        code: 'BAD_REQUEST',
        field: 'email',
      });
    }

    expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when email is invalid', async () => {
    const request = {
      body: {
        email: 'invalid',
        password: 'skljd(393@34',
      },
    } as unknown as FastifyRequest;

    try {
      await loginController.handle(request, mockReply);
    } catch (error) {
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Email must be a valid email',
        code: 'BAD_REQUEST',
        field: 'email',
      });
    }

    expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when email is invalid and has more than 255 characters', async () => {
    const request = {
      body: {
        email: 'ef3'.repeat(100),
        password: 'skljd(393@34',
      },
    } as unknown as FastifyRequest;

    try {
      await loginController.handle(request, mockReply);
    } catch (error) {
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0]).toMatchObject({
        message: 'Email must be a valid email',
        code: 'BAD_REQUEST',
        field: 'email',
      });
      expect(errors[1]).toMatchObject({
        message: 'Email must be at most 255 characters',
        code: 'BAD_REQUEST',
        field: 'email',
      });
    }

    expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when password is missing', async () => {
    const request = {
      body: {
        email: 'teste@teste.com',
      },
    } as unknown as FastifyRequest;

    try {
      await loginController.handle(request, mockReply);
    } catch (error) {
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Password is required',
        code: 'BAD_REQUEST',
        field: 'password',
      });
    }

    expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when password has more than 255 characters', async () => {
    const request = {
      body: {
        email: 'teste@teste.com',
        password: '2cs'.repeat(100),
      },
    } as unknown as FastifyRequest;

    try {
      await loginController.handle(request, mockReply);
    } catch (error) {
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Password must be at most 255 characters',
        code: 'BAD_REQUEST',
        field: 'password',
      });
    }

    expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when email and password are missing', async () => {
    const request = {
      body: {},
    } as unknown as FastifyRequest;

    try {
      await loginController.handle(request, mockReply);
    } catch (error) {
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0]).toMatchObject({
        message: 'Email is required',
        code: 'BAD_REQUEST',
        field: 'email',
      });
      expect(errors[1]).toMatchObject({
        message: 'Password is required',
        code: 'BAD_REQUEST',
        field: 'password',
      });
    }

    expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should propagate errors from the login use case', async () => {
    const notificationError = new NotificationError([
      {
        message: 'Invalid email or password',
        code: 'UNAUTHORIZED',
      },
    ]);

    mockLoginUseCase.execute.mockRejectedValueOnce(notificationError);

    await expect(loginController.handle(mockRequest, mockReply)).rejects.toThrow(notificationError);
    expect(mockLoginUseCase.execute).toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors from the login use case', async () => {
    const unexpectedError = new Error('Unexpected error');
    mockLoginUseCase.execute.mockRejectedValueOnce(unexpectedError);

    await expect(loginController.handle(mockRequest, mockReply)).rejects.toThrow(unexpectedError);
    expect(mockLoginUseCase.execute).toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
