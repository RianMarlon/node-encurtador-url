import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { CreateUserController } from '@/modules/user/infra/http/fastify/controllers/create-user.controller';
import { CreateUserUseCase } from '@/modules/user/application/usecases/create-user/create-user.usecase';

jest.mock('@/modules/user/application/usecases/create-user/create-user.usecase');

describe('CreateUserController', () => {
  let createUserController: CreateUserController;
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;

  const mockRequest = {
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
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

    jest.spyOn(container, 'resolve').mockReturnValue(mockCreateUserUseCase);

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

    expect(container.resolve).toHaveBeenCalledWith(CreateUserUseCase);
    expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it('should propagate errors from the use case', async () => {
    const mockError = new Error('Test error');
    mockCreateUserUseCase.execute.mockRejectedValueOnce(mockError);

    await expect(createUserController.handle(mockRequest, mockReply)).rejects.toThrow('Test error');

    expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
