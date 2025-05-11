import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { ListShortenedUrlsByUserIdUseCaseInputDTO } from './dto/list-shortened-urls-by-user-id-usecase-input.dto';
import { ListShortenedUrlsByUserIdUseCaseOutputDTO } from './dto/list-shortened-urls-by-user-id-usecase-output.dto';
import UseCaseInterface from '@/shared/application/use-case.interface';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

@injectable()
export class ListShortenedUrlsByUserIdUseCase implements UseCaseInterface {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
    @inject('LoggerProvider')
    private readonly logger: LoggerProvider,
  ) {}

  async execute({
    userId,
  }: ListShortenedUrlsByUserIdUseCaseInputDTO): Promise<ListShortenedUrlsByUserIdUseCaseOutputDTO> {
    this.logger.debug(`Listing all shortened URLs for user with ID ${userId}`);
    const urlShorteners = await this.urlShortenerRepository.findByUserId(userId);

    return {
      data: urlShorteners.map((urlShortener) => ({
        urlKey: urlShortener.urlKey,
        shortUrl: urlShortener.shortUrl,
        originalUrl: urlShortener.originalUrl,
        clickCount: urlShortener.clickCount,
        createdAt: urlShortener.createdAt,
        updatedAt: urlShortener.updatedAt,
      })),
    };
  }
}
