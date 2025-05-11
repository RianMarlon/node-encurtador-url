import 'reflect-metadata';

import { DeleteShortUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/delete-short-url-by-url-key/delete-short-url-by-url-key.usecase';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

jest.mock('@/modules/url-shortener/domain/entities/url-shortener.entity');

describe('DeleteShortUrlByUrlKeyUseCase', () => {
  let mockUrlShortenerRepository: jest.Mocked<UrlShortenerRepository>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;

  let deleteShortUrlByUrlKeyUseCase: DeleteShortUrlByUrlKeyUseCase;

  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUrlShortenerRepository = {
      create: jest.fn(),
      findByUrlKey: jest.fn(),
      findByUrlKeyAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockLoggerProvider = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<LoggerProvider>;

    deleteShortUrlByUrlKeyUseCase = new DeleteShortUrlByUrlKeyUseCase(
      mockUrlShortenerRepository,
      mockLoggerProvider,
    );
  });

  it('should delete the URL successfully', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';

    const mockUrlShortener: {
      id: string;
      urlKey: string;
      shortUrl: string;
      originalUrl: string;
      clickCount: number;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      delete: jest.Mock;
    } = {
      id: 'url-123',
      urlKey,
      shortUrl: `http://short.url/${urlKey}`,
      originalUrl: 'https://example.com',
      clickCount: 5,
      createdAt: mockDate,
      updatedAt: mockDate,
      deletedAt: null,
      delete: jest.fn(),
    };

    mockUrlShortener.delete.mockImplementation(function () {
      mockUrlShortener.deletedAt = new Date();
      mockUrlShortener.updatedAt = mockUrlShortener.deletedAt;
    });

    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );

    await deleteShortUrlByUrlKeyUseCase.execute({
      urlKey,
      userId,
    });

    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.delete).toHaveBeenCalled();
    expect(mockUrlShortenerRepository.delete).toHaveBeenCalledWith(mockUrlShortener);
    expect(mockUrlShortener.deletedAt).not.toBeNull();
  });

  it('should throw NotificationError when URL is not found or does not belong to the user', async () => {
    const userId = 'user-123';
    const urlKey = 'nonexistent-url';

    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(null);

    await expect(
      deleteShortUrlByUrlKeyUseCase.execute({
        urlKey,
        userId,
      }),
    ).rejects.toThrow(NotificationError);

    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortenerRepository.delete).not.toHaveBeenCalled();
  });

  it('should propagate errors from urlShortener.delete method', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';

    const deleteError = new Error('Error in delete method');

    const mockUrlShortener: {
      id: string;
      urlKey: string;
      shortUrl: string;
      originalUrl: string;
      clickCount: number;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      delete: jest.Mock;
    } = {
      id: 'url-123',
      urlKey,
      shortUrl: `http://short.url/${urlKey}`,
      originalUrl: 'https://example.com',
      clickCount: 5,
      createdAt: mockDate,
      updatedAt: mockDate,
      deletedAt: null,
      delete: jest.fn().mockImplementation(() => {
        throw deleteError;
      }),
    };

    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );

    await expect(
      deleteShortUrlByUrlKeyUseCase.execute({
        urlKey,
        userId,
      }),
    ).rejects.toThrow(deleteError);

    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.delete).toHaveBeenCalled();
    expect(mockUrlShortenerRepository.delete).not.toHaveBeenCalled();
  });

  it('should propagate errors from urlShortenerRepository.delete', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';

    const mockUrlShortener: {
      id: string;
      urlKey: string;
      shortUrl: string;
      originalUrl: string;
      clickCount: number;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      delete: jest.Mock;
    } = {
      id: 'url-123',
      urlKey,
      shortUrl: `http://short.url/${urlKey}`,
      originalUrl: 'https://example.com',
      clickCount: 5,
      createdAt: mockDate,
      updatedAt: mockDate,
      deletedAt: null,
      delete: jest.fn(),
    };

    const repositoryError = new Error('Database error during delete');

    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );
    mockUrlShortenerRepository.delete.mockRejectedValueOnce(repositoryError);

    await expect(
      deleteShortUrlByUrlKeyUseCase.execute({
        urlKey,
        userId,
      }),
    ).rejects.toThrow(repositoryError);

    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.delete).toHaveBeenCalled();
    expect(mockUrlShortenerRepository.delete).toHaveBeenCalledWith(mockUrlShortener);
  });
});
