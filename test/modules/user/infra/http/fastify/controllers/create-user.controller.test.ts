import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { CreateUserController } from '@/modules/user/infra/http/fastify/controllers/create-user.controller';
import { CreateUserUseCase } from '@/modules/user/application/usecases/create-user/create-user.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

jest.mock('@/modules/user/application/usecases/create-user/create-user.usecase');
jest.mock('@/shared/infra/providers/logger/pino-logger-provider');

describe('CreateUserController', () => {
  let createUserController: CreateUserController;
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;

  const mockRequest = {
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'passWOrd@123',
    },
  } as unknown as FastifyRequest;

  const mockReply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateUserUseCase>;

    mockLoggerProvider = {
      debug: jest.fn(),
    } as unknown as jest.Mocked<LoggerProvider>;

    container.registerInstance('LoggerProvider', mockLoggerProvider);
    container.registerInstance(CreateUserUseCase, mockCreateUserUseCase);

    createUserController = new CreateUserController();
  });

  it('should create a user and return 201 status code', async () => {
    const mockResult = {
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    mockCreateUserUseCase.execute.mockResolvedValueOnce(mockResult);

    await createUserController.handle(mockRequest, mockReply);

    expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'passWOrd@123',
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it('should throw NotificationError when name is missing', async () => {
    const mockRequest = {
      body: {
        email: 'john@example.com',
        password: 'PsS5@fs!@#s',
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Name is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'name',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when name has more than 100 characters', async () => {
    const mockRequest = {
      body: {
        name: 't'.repeat(150),
        email: 'john@example.com',
        password: 'PsS5@fs!@#s',
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Name must be at most 100 characters',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'name',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when email is missing', async () => {
    const mockRequest = {
      body: {
        name: 't'.repeat(100),
        password: 'PsS5@fs!@#s',
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Email is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'email',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when email is invalid', async () => {
    const mockRequest = {
      body: {
        name: 't'.repeat(100),
        email: 'invalid-email',
        password: 'PsS5@fs!@#s',
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Email must be a valid email',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'email',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when email has more than 255 characters', async () => {
    const mockRequest = {
      body: {
        name: 'Teste',
        email: 't'.repeat(300),
        password: 'PsS5@fs!@#s',
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0]).toMatchObject({
        message: 'Email must be a valid email',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'email',
      });
      expect(errors[0]).toMatchObject({
        message: 'Email must be a valid email',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'email',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when password is missing', async () => {
    const mockRequest = {
      body: {
        name: 'Teste',
        email: 'teste@teste.com',
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Password is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when password has less then 8 characters', async () => {
    const mockRequest = {
      body: {
        name: 'Teste',
        email: 'teste@teste.com',
        password: 'SFg1$3',
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Password must be at least 8 characters',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when password has more then 30 characters', async () => {
    const mockRequest = {
      body: {
        name: 'Teste',
        email: 'teste@teste.com',
        password: 'Sg$3'.repeat(10),
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Password must be at most 30 characters',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when password is weak', async () => {
    const mockRequest = {
      body: {
        name: 'Teste',
        email: 'teste@teste.com',
        password: 'SDF2',
      },
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(3);
      expect(errors[0]).toMatchObject({
        message: 'Password must be at least 8 characters',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
      expect(errors[1]).toMatchObject({
        message: 'Password must contain at least one lowercase letter',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
      expect(errors[2]).toMatchObject({
        message: 'Password must contain at least one special character',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when name, email and password are missing', async () => {
    const mockRequest = {
      body: {},
    } as unknown as FastifyRequest;

    try {
      await createUserController.handle(mockRequest, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(3);
      expect(errors[0]).toMatchObject({
        message: 'Name is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'name',
      });
      expect(errors[1]).toMatchObject({
        message: 'Email is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'email',
      });
      expect(errors[2]).toMatchObject({
        message: 'Password is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
    }

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should propagate errors from the use case', async () => {
    const mockError = new Error('Test error');
    mockCreateUserUseCase.execute.mockRejectedValueOnce(mockError);

    await expect(createUserController.handle(mockRequest, mockReply)).rejects.toThrow('Test error');

    expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'passWOrd@123',
    });

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
