import 'reflect-metadata';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';
import { ResolveShortUrlInputDTO } from '@/modules/url-shortener/application/usecases/resolve-short-url/dto/resolve-short-url-input.dto';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';

describe('ResolveShortUrlUseCase', () => {
  const mockUrlShortenerRepository: jest.Mocked<UrlShortenerRepository> = {
    create: jest.fn(),
    findByUrlKey: jest.fn(),
    update: jest.fn(),
  };

  let resolveShortUrlUseCase: ResolveShortUrlUseCase;

  const mockUrlKey = 'abc123';
  const mockOriginalUrl = 'https://example.com/long-url';

  const inputData: ResolveShortUrlInputDTO = {
    urlKey: mockUrlKey,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resolveShortUrlUseCase = new ResolveShortUrlUseCase(mockUrlShortenerRepository);
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

  it('should throw an error if URL is not found', async () => {
    mockUrlShortenerRepository.findByUrlKey.mockResolvedValueOnce(null);

    await expect(resolveShortUrlUseCase.execute(inputData)).rejects.toThrow('Url not found');

    expect(mockUrlShortenerRepository.findByUrlKey).toHaveBeenCalledTimes(1);
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
