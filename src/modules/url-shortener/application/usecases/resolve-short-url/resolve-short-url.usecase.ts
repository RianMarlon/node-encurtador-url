import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { ResolveShortUrlUseCaseInputDTO } from './dto/resolve-short-url-usecase-input.dto';
import { ResolveShortUrlUseCaseOutputDTO } from './dto/resolve-short-url-usecase-output.dto';
import { NotificationError } from '@/shared/domain/errors/notification-error';

@injectable()
export class ResolveShortUrlUseCase {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
  ) {}

  async execute(data: ResolveShortUrlUseCaseInputDTO): Promise<ResolveShortUrlUseCaseOutputDTO> {
    const urlShortener = await this.urlShortenerRepository.findByUrlKey(data.urlKey);

    if (!urlShortener)
      throw new NotificationError([
        {
          code: 'NOT_FOUND',
          message: 'Url not found',
          context: 'UrlShortener',
          field: 'urlKey',
        },
      ]);

    urlShortener.incrementClickCount();
    await this.urlShortenerRepository.update(urlShortener);

    return {
      originalUrl: urlShortener.originalUrl,
    };
  }
}
