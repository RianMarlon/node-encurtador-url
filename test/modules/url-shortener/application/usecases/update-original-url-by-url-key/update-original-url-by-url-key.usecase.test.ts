import 'reflect-metadata';

import { UpdateOriginalUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/update-original-url-by-url-key/update-original-url-by-url-key.usecase';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { User } from '@/modules/user/domain/entities/user.entity';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock('@/modules/url-shortener/domain/entities/url-shortener.entity');

describe('UpdateOriginalUrlByUrlKeyUseCase', () => {
  const mockUserRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockUrlShortenerRepository: jest.Mocked<UrlShortenerRepository> = {
    create: jest.fn(),
    findByUrlKey: jest.fn(),
    findByUrlKeyAndUserId: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
  };

  let updateOriginalUrlByUrlKeyUseCase: UpdateOriginalUrlByUrlKeyUseCase;
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
    updateOriginalUrlByUrlKeyUseCase = new UpdateOriginalUrlByUrlKeyUseCase(
      mockUserRepository,
      mockUrlShortenerRepository,
    );
  });

  it('should update the original URL successfully', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';
    const originalUrl = 'https://example.com/old';
    const newOriginalUrl = 'https://example.com/new';

    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

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

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );

    const result = await updateOriginalUrlByUrlKeyUseCase.execute({
      urlKey,
      originalUrl: newOriginalUrl,
      userId,
    });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
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

  it('should throw NotificationError when user is not found', async () => {
    const userId = 'nonexistent-user';
    const urlKey = 'abc123';
    const newOriginalUrl = 'https://example.com/new';

    mockUserRepository.findById.mockResolvedValueOnce(null);

    await expect(
      updateOriginalUrlByUrlKeyUseCase.execute({
        urlKey,
        originalUrl: newOriginalUrl,
        userId,
      }),
    ).rejects.toThrow(NotificationError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).not.toHaveBeenCalled();
    expect(mockUrlShortenerRepository.update).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when URL is not found or does not belong to the user', async () => {
    const userId = 'user-123';
    const urlKey = 'nonexistent-url';
    const newOriginalUrl = 'https://example.com/new';

    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(null);

    await expect(
      updateOriginalUrlByUrlKeyUseCase.execute({
        urlKey,
        originalUrl: newOriginalUrl,
        userId,
      }),
    ).rejects.toThrow(NotificationError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortenerRepository.update).not.toHaveBeenCalled();
  });

  it('should propagate errors from urlShortener.changeOriginalUrl', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';
    const originalUrl = 'https://example.com/old';
    const invalidUrl = 'invalid-url';

    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

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

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
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

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.changeOriginalUrl).toHaveBeenCalledWith(invalidUrl);
    expect(mockUrlShortenerRepository.update).not.toHaveBeenCalled();
  });

  it('should propagate errors from urlShortenerRepository.update', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';
    const originalUrl = 'https://example.com/old';
    const newOriginalUrl = 'https://example.com/new';

    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

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

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
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

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.changeOriginalUrl).toHaveBeenCalledWith(newOriginalUrl);
    expect(mockUrlShortenerRepository.update).toHaveBeenCalledWith(mockUrlShortener);
  });
});
