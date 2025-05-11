import 'reflect-metadata';

import { UpdateOriginalUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/update-original-url-by-url-key/update-original-url-by-url-key.usecase';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock('@/modules/url-shortener/domain/entities/url-shortener.entity');

describe('UpdateOriginalUrlByUrlKeyUseCase', () => {
  let mockUrlShortenerRepository: jest.Mocked<UrlShortenerRepository>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;

  let updateOriginalUrlByUrlKeyUseCase: UpdateOriginalUrlByUrlKeyUseCase;
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUrlShortenerRepository = {
      findByUrlKey: jest.fn(),
      findByUrlKeyAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockLoggerProvider = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    };

    updateOriginalUrlByUrlKeyUseCase = new UpdateOriginalUrlByUrlKeyUseCase(
      mockUrlShortenerRepository,
      mockLoggerProvider,
    );
  });

  it('should update the original URL successfully', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';
    const originalUrl = 'https://example.com/old';
    const newOriginalUrl = 'https://example.com/new';

    const mockUrlShortener = {
      id: 'url-123',
      urlKey,
      shortUrl: `http://short.url/${urlKey}`,
      originalUrl,
      clickCount: 5,
      createdAt: mockDate,
      updatedAt: mockDate,
      changeOriginalUrl: jest.fn(),
    };

    mockUrlShortener.changeOriginalUrl.mockImplementation(function () {
      mockUrlShortener.originalUrl = newOriginalUrl;
      mockUrlShortener.clickCount = 0;
      mockUrlShortener.updatedAt = new Date();
    });

    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );

    const result = await updateOriginalUrlByUrlKeyUseCase.execute({
      urlKey,
      originalUrl: newOriginalUrl,
      userId,
    });

    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.changeOriginalUrl).toHaveBeenCalledWith(newOriginalUrl);
    expect(mockUrlShortenerRepository.update).toHaveBeenCalledWith(mockUrlShortener);

    expect(result).toEqual({
      urlKey,
      shortUrl: mockUrlShortener.shortUrl,
      originalUrl: mockUrlShortener.originalUrl,
      clickCount: mockUrlShortener.clickCount,
      createdAt: mockUrlShortener.createdAt,
      updatedAt: mockUrlShortener.updatedAt,
    });
  });

  it('should throw NotificationError when URL is not found or does not belong to the user', async () => {
    const userId = 'user-123';
    const urlKey = 'nonexistent-url';
    const newOriginalUrl = 'https://example.com/new';

    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(null);

    await expect(
      updateOriginalUrlByUrlKeyUseCase.execute({
        urlKey,
        originalUrl: newOriginalUrl,
        userId,
      }),
    ).rejects.toThrow(NotificationError);

    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortenerRepository.update).not.toHaveBeenCalled();
  });

  it('should propagate errors from urlShortener.changeOriginalUrl', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';
    const originalUrl = 'https://example.com/old';
    const invalidUrl = 'invalid-url';

    const validationError = new NotificationError([
      {
        message: 'Original URL must be a valid URL',
        code: 'BAD_REQUEST',
        context: 'UrlShortener',
        field: 'originalUrl',
      },
    ]);

    const mockUrlShortener = {
      id: 'url-123',
      urlKey,
      shortUrl: `http://short.url/${urlKey}`,
      originalUrl,
      clickCount: 5,
      createdAt: mockDate,
      updatedAt: mockDate,
      changeOriginalUrl: jest.fn(),
    };

    mockUrlShortener.changeOriginalUrl.mockImplementation(() => {
      throw validationError;
    });

    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );

    await expect(
      updateOriginalUrlByUrlKeyUseCase.execute({
        urlKey,
        originalUrl: invalidUrl,
        userId,
      }),
    ).rejects.toThrow(validationError);

    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.changeOriginalUrl).toHaveBeenCalledWith(invalidUrl);
    expect(mockUrlShortenerRepository.update).not.toHaveBeenCalled();
  });

  it('should propagate errors from urlShortenerRepository.update', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';
    const originalUrl = 'https://example.com/old';
    const newOriginalUrl = 'https://example.com/new';

    const mockUrlShortener = {
      id: 'url-123',
      urlKey,
      shortUrl: `http://short.url/${urlKey}`,
      originalUrl,
      clickCount: 5,
      createdAt: mockDate,
      updatedAt: mockDate,
      changeOriginalUrl: jest.fn(),
    };

    const updateError = new Error('Database error during update');

    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );
    mockUrlShortenerRepository.update.mockRejectedValueOnce(updateError);

    await expect(
      updateOriginalUrlByUrlKeyUseCase.execute({
        urlKey,
        originalUrl: newOriginalUrl,
        userId,
      }),
    ).rejects.toThrow(updateError);

    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.changeOriginalUrl).toHaveBeenCalledWith(newOriginalUrl);
    expect(mockUrlShortenerRepository.update).toHaveBeenCalledWith(mockUrlShortener);
  });
});
