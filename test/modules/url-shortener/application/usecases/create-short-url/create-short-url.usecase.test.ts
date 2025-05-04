import 'reflect-metadata';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';
import { CreateShortUrlInputDTO } from '@/modules/url-shortener/application/usecases/create-short-url/dto/create-short-url-input.dto';

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
    update: jest.fn(),
  };

  let createShortUrlUseCase: CreateShortUrlUseCase;

  const inputData: CreateShortUrlInputDTO = {
    originalUrl: 'https://example.com/long-url',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createShortUrlUseCase = new CreateShortUrlUseCase(mockUrlShortenerRepository);
  });

  it('should create a new short URL', async () => {
    const result = await createShortUrlUseCase.execute(inputData);

    expect(mockUrlShortenerRepository.create).toHaveBeenCalledTimes(1);

    expect(result.originalUrl).toEqual(inputData.originalUrl);
    expect(result.shortUrl).toBeDefined();
  });

  it('should throw an error if repository.create fails', async () => {
    const errorMessage = 'Failed to create short URL';
    mockUrlShortenerRepository.create.mockRejectedValueOnce(new Error(errorMessage));

    await expect(createShortUrlUseCase.execute(inputData)).rejects.toThrow(errorMessage);
    expect(mockUrlShortenerRepository.create).toHaveBeenCalledTimes(1);
  });
});
