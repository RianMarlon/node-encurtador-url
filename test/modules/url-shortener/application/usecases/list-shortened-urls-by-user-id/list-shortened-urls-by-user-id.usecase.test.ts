import 'reflect-metadata';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { ListShortenedUrlsByUserIdUseCase } from '@/modules/url-shortener/application/usecases/list-shortened-urls-by-user-id/list-shortened-urls-by-user-id.usecase';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';

const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  process.env.BASE_URL = 'http://short.url';
});

afterEach(() => {
  process.env = originalEnv;
});

describe('ListShortenedUrlsByUserIdUseCase', () => {
  const mockUrlShortenerRepository: jest.Mocked<UrlShortenerRepository> = {
    create: jest.fn(),
    findByUrlKey: jest.fn(),
    findByUrlKeyAndUserId: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let listShortenedUrlsByUserIdUseCase: ListShortenedUrlsByUserIdUseCase;
  const userId = 'user-123';
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
    listShortenedUrlsByUserIdUseCase = new ListShortenedUrlsByUserIdUseCase(
      mockUrlShortenerRepository,
    );
  });

  it('should return a list of shortened URLs for a valid user', async () => {
    const mockUrlShorteners = [
      new UrlShortener({
        id: 'url-1',
        urlKey: 'abc123',
        originalUrl: 'https://example.com/1',
        clickCount: 5,
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
      new UrlShortener({
        id: 'url-2',
        urlKey: 'def456',
        originalUrl: 'https://example.com/2',
        clickCount: 10,
        createdAt: mockDate,
        updatedAt: mockDate,
      }),
    ];

    mockUrlShortenerRepository.findByUserId.mockResolvedValueOnce(mockUrlShorteners);

    const result = await listShortenedUrlsByUserIdUseCase.execute({ userId });

    expect(mockUrlShortenerRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      urlKey: 'abc123',
      shortUrl: 'http://short.url/abc123',
      originalUrl: 'https://example.com/1',
      clickCount: 5,
      createdAt: mockDate,
      updatedAt: mockDate,
    });
    expect(result.data[1]).toEqual({
      urlKey: 'def456',
      shortUrl: 'http://short.url/def456',
      originalUrl: 'https://example.com/2',
      clickCount: 10,
      createdAt: mockDate,
      updatedAt: mockDate,
    });
  });

  it('should return an empty array when user has no URLs', async () => {
    mockUrlShortenerRepository.findByUserId.mockResolvedValueOnce([]);

    const result = await listShortenedUrlsByUserIdUseCase.execute({ userId });

    expect(mockUrlShortenerRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(result.data).toEqual([]);
  });

  it('should throw an error if repository.findByUserId fails', async () => {
    const errorMessage = 'Failed to fetch user URLs';
    mockUrlShortenerRepository.findByUserId.mockRejectedValueOnce(new Error(errorMessage));

    await expect(listShortenedUrlsByUserIdUseCase.execute({ userId })).rejects.toThrow(
      errorMessage,
    );
    expect(mockUrlShortenerRepository.findByUserId).toHaveBeenCalledWith(userId);
  });
});
