import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { ResolveShortUrlInputDTO } from './dto/resolve-short-url-input.dto';
import { ResolveShortUrlOutputDTO } from './dto/resolve-short-url-output.dto';
import { NotificationError } from '@/shared/domain/errors/notification-error';

@injectable()
export class ResolveShortUrlUseCase {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
  ) {}

  async execute(data: ResolveShortUrlInputDTO): Promise<ResolveShortUrlOutputDTO> {
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
