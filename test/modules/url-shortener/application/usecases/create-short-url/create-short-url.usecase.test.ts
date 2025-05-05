import 'reflect-metadata';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';
import { CreateShortUrlUseCaseInputDTO } from '@/modules/url-shortener/application/usecases/create-short-url/dto/create-short-url-usecase-input.dto';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { User } from '@/modules/user/domain/entities/user.entity';

const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  process.env.BASE_URL = 'http://short.url';
});

afterEach(() => {
  process.env = originalEnv;
});

describe('CreateShortUrlUseCase', () => {
  const mockUrlShortenerRepository: jest.Mocked<UrlShortenerRepository> = {
    create: jest.fn(),
    findByUrlKey: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  let createShortUrlUseCase: CreateShortUrlUseCase;

  const inputData: CreateShortUrlUseCaseInputDTO = {
    originalUrl: 'https://example.com/long-url',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createShortUrlUseCase = new CreateShortUrlUseCase(
      mockUrlShortenerRepository,
      mockUserRepository,
    );
  });

  it('should create a new short URL without userId', async () => {
    const result = await createShortUrlUseCase.execute(inputData);

    expect(mockUrlShortenerRepository.create).toHaveBeenCalledTimes(1);
    expect(mockUrlShortenerRepository.create).toHaveBeenCalledWith(expect.any(Object), undefined);
    expect(mockUserRepository.findById).not.toHaveBeenCalled();

    expect(result.originalUrl).toEqual(inputData.originalUrl);
    expect(result.shortUrl).toBeDefined();
  });

  it('should create a new short URL with userId when user exists', async () => {
    const userId = 'user-123';
    const inputWithUser: CreateShortUrlUseCaseInputDTO = {
      ...inputData,
      userId,
    };

    const mockUser = { id: userId } as User;
    mockUserRepository.findById.mockResolvedValueOnce(mockUser);

    const result = await createShortUrlUseCase.execute(inputWithUser);

    expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.create).toHaveBeenCalledTimes(1);
    expect(mockUrlShortenerRepository.create).toHaveBeenCalledWith(expect.any(Object), userId);

    expect(result.originalUrl).toEqual(inputData.originalUrl);
    expect(result.shortUrl).toBeDefined();
  });

  it('should throw NotificationError with UNAUTHORIZED code when userId is provided but user does not exist', async () => {
    const userId = 'nonexistent-user-id';
    const inputWithUser: CreateShortUrlUseCaseInputDTO = {
      ...inputData,
      userId,
    };

    mockUserRepository.findById.mockResolvedValueOnce(null);

    try {
      await createShortUrlUseCase.execute(inputWithUser);
      fail('Expected NotificationError to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const notificationErrors = (error as NotificationError).getErrors();
      expect(notificationErrors[0].code).toBe('UNAUTHORIZED');
      expect(notificationErrors[0].message).toBe('User not found');
    }

    expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUrlShortenerRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an error if repository.create fails', async () => {
    const errorMessage = 'Failed to create short URL';
    mockUrlShortenerRepository.create.mockRejectedValueOnce(new Error(errorMessage));

    await expect(createShortUrlUseCase.execute(inputData)).rejects.toThrow(errorMessage);
    expect(mockUrlShortenerRepository.create).toHaveBeenCalledTimes(1);
  });
});
