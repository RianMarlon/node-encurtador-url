import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { ResolveShortUrlController } from '@/modules/url-shortener/infra/http/fastify/controllers/resolve-short-url.controller';
import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

jest.mock(
  '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase',
);

describe('ResolveShortUrlController', () => {
  let resolveShortUrlController: ResolveShortUrlController;
  let mockResolveShortUrlUseCase: jest.Mocked<ResolveShortUrlUseCase>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;

  const urlKey = '0196b231-1b20-7455-81f5-f85f8c1330a8';
  const userId = '0196b231-1b20-7455-81f5-f85f8c1330a8';

  const mockRequest = {
    params: {
      urlKey,
    },
  } as unknown as FastifyRequest;

  const mockReply = {
    redirect: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResolveShortUrlUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ResolveShortUrlUseCase>;

    mockLoggerProvider = {
      debug: jest.fn(),
    } as unknown as jest.Mocked<LoggerProvider>;

    container.registerInstance('LoggerProvider', mockLoggerProvider);
    container.registerInstance(ResolveShortUrlUseCase, mockResolveShortUrlUseCase);

    resolveShortUrlController = new ResolveShortUrlController();
  });

  it('should resolve a short URL and redirect to the original URL', async () => {
    const mockOriginalUrl = 'https://example.com/long-url';
    mockResolveShortUrlUseCase.execute.mockResolvedValueOnce({
      originalUrl: mockOriginalUrl,
    });

    await resolveShortUrlController.handle(mockRequest, mockReply);

    expect(mockResolveShortUrlUseCase.execute).toHaveBeenCalledWith({
      urlKey,
    });

    expect(mockReply.redirect).toHaveBeenCalledWith(mockOriginalUrl);
  });

  it('should throw NotificationError when urlKey is missing', async () => {
    const mockRequestError = {
      params: {},
      user: {
        id: userId,
      },
    } as unknown as FastifyRequest;

    try {
      await resolveShortUrlController.handle(mockRequestError, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);

      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'The urlKey parameter is required',
        code: 'BAD_REQUEST',
        context: 'UrlShortener',
        field: 'urlKey',
      });
    }

    expect(mockResolveShortUrlUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('should propagate NotificationError from the use case', async () => {
    const notificationError = new NotificationError([
      {
        code: 'NOT_FOUND',
        message: 'Url not found',
        context: 'UrlShortener',
        field: 'urlKey',
      },
    ]);

    mockResolveShortUrlUseCase.execute.mockRejectedValueOnce(notificationError);

    await expect(resolveShortUrlController.handle(mockRequest, mockReply)).rejects.toThrow(
      NotificationError,
    );

    expect(mockResolveShortUrlUseCase.execute).toHaveBeenCalledWith({
      urlKey,
    });

    expect(mockReply.redirect).not.toHaveBeenCalled();
  });

  it('should propagate generic errors from the use case', async () => {
    const mockError = new Error('Database error');
    mockResolveShortUrlUseCase.execute.mockRejectedValueOnce(mockError);

    await expect(resolveShortUrlController.handle(mockRequest, mockReply)).rejects.toThrow(
      'Database error',
    );

    expect(mockResolveShortUrlUseCase.execute).toHaveBeenCalledWith({
      urlKey,
    });

    expect(mockReply.redirect).not.toHaveBeenCalled();
  });
});
