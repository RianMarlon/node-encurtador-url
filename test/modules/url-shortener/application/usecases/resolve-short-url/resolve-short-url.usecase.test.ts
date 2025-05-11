import 'reflect-metadata';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';
import { ResolveShortUrlUseCaseInputDTO } from '@/modules/url-shortener/application/usecases/resolve-short-url/dto/resolve-short-url-usecase-input.dto';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

describe('ResolveShortUrlUseCase', () => {
  let mockUrlShortenerRepository: jest.Mocked<UrlShortenerRepository>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;

  let resolveShortUrlUseCase: ResolveShortUrlUseCase;

  const mockUrlKey = 'abc123';
  const mockOriginalUrl = 'https://example.com/long-url';

  const inputData: ResolveShortUrlUseCaseInputDTO = {
    urlKey: mockUrlKey,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUrlShortenerRepository = {
      findByUserId: jest.fn(),
      findByUrlKeyAndUserId: jest.fn(),
      findByUrlKey: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockLoggerProvider = {
      debug: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    } as unknown as jest.Mocked<LoggerProvider>;

    resolveShortUrlUseCase = new ResolveShortUrlUseCase(
      mockUrlShortenerRepository,
      mockLoggerProvider,
    );
  });

  it('should resolve to the original URL and increment click count', async () => {
    const mockUrlShortener = {
      id: 'mock-id',
      urlKey: mockUrlKey,
      shortUrl: `http://short.url/${mockUrlKey}`,
      originalUrl: mockOriginalUrl,
      clickCount: 5,
      incrementClickCount: jest.fn(),
    } as unknown as UrlShortener;

    mockUrlShortenerRepository.findByUrlKey.mockResolvedValueOnce(mockUrlShortener);

    const result = await resolveShortUrlUseCase.execute(inputData);

    expect(mockUrlShortenerRepository.findByUrlKey).toHaveBeenCalledTimes(1);
    expect(mockUrlShortenerRepository.findByUrlKey).toHaveBeenCalledWith(mockUrlKey);

    expect(mockUrlShortener.incrementClickCount).toHaveBeenCalledTimes(1);

    expect(mockUrlShortenerRepository.update).toHaveBeenCalledTimes(1);
    expect(mockUrlShortenerRepository.update).toHaveBeenCalledWith(mockUrlShortener);

    expect(result).toEqual({
      originalUrl: mockOriginalUrl,
    });
  });

  it('should throw a NotificationError if URL is not found', async () => {
    mockUrlShortenerRepository.findByUrlKey.mockResolvedValueOnce(null);

    await expect(resolveShortUrlUseCase.execute(inputData)).rejects.toThrow(NotificationError);

    try {
      await resolveShortUrlUseCase.execute(inputData);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const notificationError = error as NotificationError;
      const errors = notificationError.getErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        code: 'NOT_FOUND',
        message: 'Url not found',
        context: 'UrlShortener',
        field: 'urlKey',
      });
    }

    expect(mockUrlShortenerRepository.findByUrlKey).toHaveBeenCalledTimes(2);
    expect(mockUrlShortenerRepository.findByUrlKey).toHaveBeenCalledWith(mockUrlKey);

    expect(mockUrlShortenerRepository.update).not.toHaveBeenCalled();
  });

  it('should throw an error if repository.findByUrlKey fails', async () => {
    const errorMessage = 'Database error';
    mockUrlShortenerRepository.findByUrlKey.mockRejectedValueOnce(new Error(errorMessage));

    await expect(resolveShortUrlUseCase.execute(inputData)).rejects.toThrow(errorMessage);

    expect(mockUrlShortenerRepository.findByUrlKey).toHaveBeenCalledTimes(1);
    expect(mockUrlShortenerRepository.update).not.toHaveBeenCalled();
  });

  it('should throw an error if repository.update fails', async () => {
    const mockUrlShortener = {
      id: 'mock-id',
      urlKey: mockUrlKey,
      shortUrl: `http://short.url/${mockUrlKey}`,
      originalUrl: mockOriginalUrl,
      clickCount: 5,
      incrementClickCount: jest.fn(),
    } as unknown as UrlShortener;

    const errorMessage = 'Update error';
    mockUrlShortenerRepository.findByUrlKey.mockResolvedValueOnce(mockUrlShortener);
    mockUrlShortenerRepository.update.mockRejectedValueOnce(new Error(errorMessage));

    await expect(resolveShortUrlUseCase.execute(inputData)).rejects.toThrow(errorMessage);

    expect(mockUrlShortenerRepository.findByUrlKey).toHaveBeenCalledTimes(1);
    expect(mockUrlShortener.incrementClickCount).toHaveBeenCalledTimes(1);
    expect(mockUrlShortenerRepository.update).toHaveBeenCalledTimes(1);
  });
});
