import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { ResolveShortUrlController } from '@/modules/url-shortener/infra/http/fastify/controllers/resolve-short-url.controller';
import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock(
  '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase',
);

describe('ResolveShortUrlController', () => {
  let resolveShortUrlController: ResolveShortUrlController;
  let mockResolveShortUrlUseCase: jest.Mocked<ResolveShortUrlUseCase>;

  const mockRequest = {
    params: {
      urlKey: 'abc123',
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

    jest.spyOn(container, 'resolve').mockReturnValue(mockResolveShortUrlUseCase);

    resolveShortUrlController = new ResolveShortUrlController();
  });

  it('should resolve a short URL and redirect to the original URL', async () => {
    const mockOriginalUrl = 'https://example.com/long-url';
    mockResolveShortUrlUseCase.execute.mockResolvedValueOnce({
      originalUrl: mockOriginalUrl,
    });

    await resolveShortUrlController.handle(mockRequest, mockReply);

    expect(container.resolve).toHaveBeenCalledWith(ResolveShortUrlUseCase);
    expect(mockResolveShortUrlUseCase.execute).toHaveBeenCalledWith({
      urlKey: 'abc123',
    });

    expect(mockReply.redirect).toHaveBeenCalledWith(mockOriginalUrl);
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
      urlKey: 'abc123',
    });

    // Verificar que redirect não foi chamado
    expect(mockReply.redirect).not.toHaveBeenCalled();
  });

  it('should propagate generic errors from the use case', async () => {
    const mockError = new Error('Database error');
    mockResolveShortUrlUseCase.execute.mockRejectedValueOnce(mockError);

    await expect(resolveShortUrlController.handle(mockRequest, mockReply)).rejects.toThrow(
      'Database error',
    );

    expect(mockResolveShortUrlUseCase.execute).toHaveBeenCalledWith({
      urlKey: 'abc123',
    });

    expect(mockReply.redirect).not.toHaveBeenCalled();
  });
});
