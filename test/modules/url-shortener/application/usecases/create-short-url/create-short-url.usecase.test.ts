import 'reflect-metadata';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';
import { CreateShortUrlUseCaseInputDTO } from '@/modules/url-shortener/application/usecases/create-short-url/dto/create-short-url-usecase-input.dto';

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
    findByUrlKeyAndUserId: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let createShortUrlUseCase: CreateShortUrlUseCase;

  const inputData: CreateShortUrlUseCaseInputDTO = {
    originalUrl: 'https://example.com/long-url',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createShortUrlUseCase = new CreateShortUrlUseCase(mockUrlShortenerRepository);
  });

  it('should create a new short URL without userId', async () => {
    const result = await createShortUrlUseCase.execute(inputData);

    expect(mockUrlShortenerRepository.create).toHaveBeenCalledTimes(1);
    expect(mockUrlShortenerRepository.create).toHaveBeenCalledWith(expect.any(Object), undefined);

    expect(result.originalUrl).toEqual(inputData.originalUrl);
    expect(result.shortUrl).toBeDefined();
    expect(result.urlKey).toBeDefined();
    expect(result.shortUrl).toContain(result.urlKey);
  });

  it('should create a new short URL with userId when user exists', async () => {
    const userId = 'user-123';
    const inputWithUser: CreateShortUrlUseCaseInputDTO = {
      ...inputData,
      userId,
    };

    const result = await createShortUrlUseCase.execute(inputWithUser);

    expect(mockUrlShortenerRepository.create).toHaveBeenCalledTimes(1);
    expect(mockUrlShortenerRepository.create).toHaveBeenCalledWith(expect.any(Object), userId);

    expect(result.originalUrl).toEqual(inputData.originalUrl);
    expect(result.shortUrl).toBeDefined();
    expect(result.urlKey).toBeDefined();
    expect(result.shortUrl).toEqual(`${process.env.BASE_URL}/${result.urlKey}`);
  });

  it('should throw an error if repository.create fails', async () => {
    const errorMessage = 'Failed to create short URL';
    mockUrlShortenerRepository.create.mockRejectedValueOnce(new Error(errorMessage));

    await expect(createShortUrlUseCase.execute(inputData)).rejects.toThrow(errorMessage);
    expect(mockUrlShortenerRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should return the correct output structure', async () => {
    mockUrlShortenerRepository.create.mockImplementation((entity) => {
      expect(entity).toHaveProperty('urlKey');
      expect(entity).toHaveProperty('shortUrl');
      expect(entity).toHaveProperty('originalUrl', inputData.originalUrl);
      return Promise.resolve();
    });

    const result = await createShortUrlUseCase.execute(inputData);

    expect(result).toHaveProperty('urlKey');
    expect(result).toHaveProperty('shortUrl');
    expect(result).toHaveProperty('originalUrl');

    expect(result.originalUrl).toBe(inputData.originalUrl);
    expect(typeof result.urlKey).toBe('string');
    expect(typeof result.shortUrl).toBe('string');
    expect(result.shortUrl).toContain(result.urlKey);

    const outputKeys = Object.keys(result);
    expect(outputKeys).toHaveLength(3);
    expect(outputKeys).toContain('urlKey');
    expect(outputKeys).toContain('shortUrl');
    expect(outputKeys).toContain('originalUrl');
  });
});
