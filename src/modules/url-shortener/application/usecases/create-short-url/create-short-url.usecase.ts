import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { CreateShortUrlOutputDTO } from './dto/create-short-url-output.dto';
import { CreateShortUrlInputDTO } from './dto/create-short-url-input.dto';

@injectable()
export class CreateShortUrlUseCase {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
  ) {}

  async execute(data: CreateShortUrlInputDTO): Promise<CreateShortUrlOutputDTO> {
    const urlShortner = new UrlShortener({ originalUrl: data.originalUrl });

    await this.urlShortenerRepository.create(urlShortner);

    return {
      shortUrl: urlShortner.shortUrl,
      originalUrl: urlShortner.originalUrl,
    };
  }
}
