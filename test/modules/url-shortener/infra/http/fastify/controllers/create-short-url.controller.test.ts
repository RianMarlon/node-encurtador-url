import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { CreateShortUrlController } from '@/modules/url-shortener/infra/http/fastify/controllers/create-short-url.controller';
import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';

jest.mock('@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase');

describe('CreateShortUrlController', () => {
  let createShortUrlController: CreateShortUrlController;
  let mockCreateShortUrlUseCase: jest.Mocked<CreateShortUrlUseCase>;

  const mockRequest = {
    body: {
      originalUrl: 'https://example.com/long-url',
    },
    user: undefined,
  } as unknown as FastifyRequest;

  const mockReply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateShortUrlUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateShortUrlUseCase>;

    jest.spyOn(container, 'resolve').mockReturnValue(mockCreateShortUrlUseCase);

    createShortUrlController = new CreateShortUrlController();
  });

  it('should create a short URL and return 201 status code', async () => {
    const mockResult = {
      shortUrl: 'http://short.url/abc123',
      originalUrl: 'https://example.com/long-url',
    };

    mockCreateShortUrlUseCase.execute.mockResolvedValueOnce(mockResult);

    await createShortUrlController.handle(mockRequest, mockReply);

    expect(container.resolve).toHaveBeenCalledWith(CreateShortUrlUseCase);
    expect(mockCreateShortUrlUseCase.execute).toHaveBeenCalledWith({
      originalUrl: 'https://example.com/long-url',
      userId: undefined,
    });

    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it('should pass user ID when user is authenticated', async () => {
    const userId = 'user-123';
    const authenticatedRequest = {
      ...mockRequest,
      user: { id: userId },
    } as unknown as FastifyRequest;

    const mockResult = {
      shortUrl: 'http://short.url/abc123',
      originalUrl: 'https://example.com/long-url',
    };

    mockCreateShortUrlUseCase.execute.mockResolvedValueOnce(mockResult);

    await createShortUrlController.handle(authenticatedRequest, mockReply);

    expect(mockCreateShortUrlUseCase.execute).toHaveBeenCalledWith({
      originalUrl: 'https://example.com/long-url',
      userId,
    });
  });

  it('should propagate errors from the use case', async () => {
    const mockError = new Error('Test error');
    mockCreateShortUrlUseCase.execute.mockRejectedValueOnce(mockError);

    await expect(createShortUrlController.handle(mockRequest, mockReply)).rejects.toThrow(
      'Test error',
    );

    expect(mockCreateShortUrlUseCase.execute).toHaveBeenCalledWith({
      originalUrl: 'https://example.com/long-url',
      userId: undefined,
    });

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
