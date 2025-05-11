import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { ResolveShortUrlUseCaseInputDTO } from './dto/resolve-short-url-usecase-input.dto';
import { ResolveShortUrlUseCaseOutputDTO } from './dto/resolve-short-url-usecase-output.dto';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import UseCaseInterface from '@/shared/application/use-case.interface';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

@injectable()
export class ResolveShortUrlUseCase implements UseCaseInterface {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
    @inject('LoggerProvider')
    private readonly logger: LoggerProvider,
  ) {}

  async execute(data: ResolveShortUrlUseCaseInputDTO): Promise<ResolveShortUrlUseCaseOutputDTO> {
    this.logger.debug(`Resolving short URL for key ${data.urlKey}`);
    const urlShortener = await this.urlShortenerRepository.findByUrlKey(data.urlKey);

    if (!urlShortener) {
      this.logger.warn(`Short URL with key ${data.urlKey} not found.`);
      throw new NotificationError([
        {
          code: 'NOT_FOUND',
          message: 'Url not found',
          context: 'UrlShortener',
          field: 'urlKey',
        },
      ]);
    }

    urlShortener.incrementClickCount();
    await this.urlShortenerRepository.update(urlShortener);

    this.logger.info(
      `Short URL with key ${data.urlKey} resolved to ${urlShortener.originalUrl}. Click count incremented.`,
    );

    return {
      originalUrl: urlShortener.originalUrl,
    };
  }
}
