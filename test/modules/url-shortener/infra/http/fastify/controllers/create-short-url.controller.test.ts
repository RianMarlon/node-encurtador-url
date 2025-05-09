import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { CreateShortUrlController } from '@/modules/url-shortener/infra/http/fastify/controllers/create-short-url.controller';
import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock('@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase');

describe('CreateShortUrlController', () => {
  let createShortUrlController: CreateShortUrlController;
  let mockCreateShortUrlUseCase: jest.Mocked<CreateShortUrlUseCase>;

  const userId = '0196b231-1b20-7455-81f5-f85f8c1330a8';

  const mockRequest = {
    body: {
      originalUrl: 'https://example.com/long-url',
    },
    user: undefined,
  } as unknown as FastifyRequest;

  const mockUseCaseResult = {
    urlKey: 'abc123',
    shortUrl: 'http://short.url/abc123',
    originalUrl: 'https://example.com/long-url',
  };

  const mockReply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateShortUrlUseCase = {
      execute: jest.fn().mockResolvedValue(mockUseCaseResult),
    } as unknown as jest.Mocked<CreateShortUrlUseCase>;

    jest.spyOn(container, 'resolve').mockReturnValue(mockCreateShortUrlUseCase);

    createShortUrlController = new CreateShortUrlController();
  });

  it('should create a short URL and return 201 status code', async () => {
    await createShortUrlController.handle(mockRequest, mockReply);

    expect(container.resolve).toHaveBeenCalledWith(CreateShortUrlUseCase);
    expect(mockCreateShortUrlUseCase.execute).toHaveBeenCalledWith({
      originalUrl: 'https://example.com/long-url',
      userId: undefined,
    });

    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith(mockUseCaseResult);
  });

  it('should pass user ID when user is authenticated', async () => {
    const userId = 'user-123';
    const authenticatedRequest = {
      ...mockRequest,
      user: { id: userId },
    } as unknown as FastifyRequest;

    const mockResult = {
      urlKey: 'abc123',
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

  it('should throw NotificationError when originalUrl is missing', async () => {
    const mockRequestError = {
      body: {},
      user: {
        id: userId,
      },
    } as unknown as FastifyRequest;

    try {
      await createShortUrlController.handle(mockRequestError, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);

      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Original URL is required',
        code: 'BAD_REQUEST',
        context: 'UrlShortener',
        field: 'originalUrl',
      });
    }

    expect(mockCreateShortUrlUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when originalUrl is invalid', async () => {
    const mockRequestError = {
      body: {
        originalUrl: 1222,
      },
      user: {
        id: userId,
      },
    } as unknown as FastifyRequest;

    try {
      await createShortUrlController.handle(mockRequestError, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);

      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Original URL must be a valid URL',
        code: 'BAD_REQUEST',
        context: 'UrlShortener',
        field: 'originalUrl',
      });
    }

    expect(mockCreateShortUrlUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
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
