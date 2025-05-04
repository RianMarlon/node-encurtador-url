import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { LoginController } from '@/modules/auth/infra/http/fastify/controllers/login.controller';
import { LoginUseCase } from '@/modules/auth/application/usecases/login/login.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock('@/modules/auth/application/usecases/login/login.usecase');

describe('LoginController', () => {
  let loginController: LoginController;
  let mockLoginUseCase: jest.Mocked<LoginUseCase>;

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

    jest.spyOn(container, 'resolve').mockReturnValue(mockLoginUseCase);

    loginController = new LoginController();
  });

  it('should return 200 status code and access token on successful login', async () => {
    const mockAccessToken = 'mock.jwt.token';
    mockLoginUseCase.execute.mockResolvedValueOnce({ accessToken: mockAccessToken });

    await loginController.handle(mockRequest, mockReply);

    expect(container.resolve).toHaveBeenCalledWith(LoginUseCase);
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
