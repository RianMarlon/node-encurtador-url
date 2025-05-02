import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { ResolveShortUrlInputDTO } from './dto/resolve-short-url-input.dto';
import { ResolveShortUrlOutputDTO } from './dto/resolve-short-url-output.dto';

export class ResolveShortUrlUseCase {
  constructor(private readonly urlShortenerRepository: UrlShortenerRepository) {}

  async execute(data: ResolveShortUrlInputDTO): Promise<ResolveShortUrlOutputDTO> {
    const urlShortener = await this.urlShortenerRepository.findByUrlKey(data.urlKey);

    if (!urlShortener) throw new Error('Url not found');

    urlShortener.incrementClickCount();
    await this.urlShortenerRepository.update(urlShortener);

    return {
      originalUrl: urlShortener.originalUrl,
    };
  }
}
