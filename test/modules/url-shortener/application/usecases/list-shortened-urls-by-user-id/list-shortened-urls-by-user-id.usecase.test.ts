import 'reflect-metadata';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { ListShortenedUrlsByUserIdUseCase } from '@/modules/url-shortener/application/usecases/list-shortened-urls-by-user-id/list-shortened-urls-by-user-id.usecase';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { User } from '@/modules/user/domain/entities/user.entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

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
    findByUserId: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  let listShortenedUrlsByUserIdUseCase: ListShortenedUrlsByUserIdUseCase;
  const userId = 'user-123';
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
    listShortenedUrlsByUserIdUseCase = new ListShortenedUrlsByUserIdUseCase(
      mockUrlShortenerRepository,
      mockUserRepository,
    );
  });

  it('should return a list of shortened URLs for a valid user', async () => {
    // Arrange
    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

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

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockUrlShortenerRepository.findByUserId.mockResolvedValueOnce(mockUrlShorteners);

    // Act
    const result = await listShortenedUrlsByUserIdUseCase.execute({ userId });

    // Assert
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
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
    // Arrange
    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockUrlShortenerRepository.findByUserId.mockResolvedValueOnce([]);

    // Act
    const result = await listShortenedUrlsByUserIdUseCase.execute({ userId });

    // Assert
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(result.data).toEqual([]);
  });

  it('should throw an UNAUTHORIZED error when user is not found', async () => {
    // Arrange
    mockUserRepository.findById.mockResolvedValueOnce(null);

    // Act & Assert
    await expect(listShortenedUrlsByUserIdUseCase.execute({ userId })).rejects.toThrow(
      NotificationError,
    );

    try {
      await listShortenedUrlsByUserIdUseCase.execute({ userId });
    } catch (error) {
      const notificationError = error as NotificationError;
      const errors = notificationError.getErrors();
      expect(errors[0].code).toBe('UNAUTHORIZED');
      expect(errors[0].message).toBe('User not found');
    }

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('should throw an error if repository.findByUserId fails', async () => {
    // Arrange
    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

    const errorMessage = 'Failed to fetch user URLs';
    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockUrlShortenerRepository.findByUserId.mockRejectedValueOnce(new Error(errorMessage));

    // Act & Assert
    await expect(listShortenedUrlsByUserIdUseCase.execute({ userId })).rejects.toThrow(errorMessage);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUserId).toHaveBeenCalledWith(userId);
  });
});