import 'reflect-metadata';

import { DeleteShortUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/delete-short-url-by-url-key/delete-short-url-by-url-key.usecase';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { User } from '@/modules/user/domain/entities/user.entity';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock('@/modules/url-shortener/domain/entities/url-shortener.entity');

describe('DeleteShortUrlByUrlKeyUseCase', () => {
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
    delete: jest.fn(),
  };

  let deleteShortUrlByUrlKeyUseCase: DeleteShortUrlByUrlKeyUseCase;
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
    deleteShortUrlByUrlKeyUseCase = new DeleteShortUrlByUrlKeyUseCase(
      mockUserRepository,
      mockUrlShortenerRepository,
    );
  });

  it('should delete the URL successfully', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';

    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

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

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );

    await deleteShortUrlByUrlKeyUseCase.execute({
      urlKey,
      userId,
    });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.delete).toHaveBeenCalled();
    expect(mockUrlShortenerRepository.delete).toHaveBeenCalledWith(mockUrlShortener);
    expect(mockUrlShortener.deletedAt).not.toBeNull();
  });

  it('should throw NotificationError when user is not found', async () => {
    const userId = 'nonexistent-user';
    const urlKey = 'abc123';

    mockUserRepository.findById.mockResolvedValueOnce(null);

    await expect(
      deleteShortUrlByUrlKeyUseCase.execute({
        urlKey,
        userId,
      }),
    ).rejects.toThrow(NotificationError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).not.toHaveBeenCalled();
    expect(mockUrlShortenerRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when URL is not found or does not belong to the user', async () => {
    const userId = 'user-123';
    const urlKey = 'nonexistent-url';

    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(null);

    await expect(
      deleteShortUrlByUrlKeyUseCase.execute({
        urlKey,
        userId,
      }),
    ).rejects.toThrow(NotificationError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortenerRepository.delete).not.toHaveBeenCalled();
  });

  it('should propagate errors from urlShortener.delete method', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';

    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

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

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    mockUrlShortenerRepository.findByUrlKeyAndUserId.mockResolvedValueOnce(
      mockUrlShortener as unknown as UrlShortener,
    );

    await expect(
      deleteShortUrlByUrlKeyUseCase.execute({
        urlKey,
        userId,
      }),
    ).rejects.toThrow(deleteError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.delete).toHaveBeenCalled();
    expect(mockUrlShortenerRepository.delete).not.toHaveBeenCalled();
  });

  it('should propagate errors from urlShortenerRepository.delete', async () => {
    const userId = 'user-123';
    const urlKey = 'abc123';

    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    } as User;

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

    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
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

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.findByUrlKeyAndUserId).toHaveBeenCalledWith(urlKey, userId);
    expect(mockUrlShortener.delete).toHaveBeenCalled();
    expect(mockUrlShortenerRepository.delete).toHaveBeenCalledWith(mockUrlShortener);
  });
});
