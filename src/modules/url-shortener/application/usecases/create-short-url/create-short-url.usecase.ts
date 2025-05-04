import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { CreateShortUrlUseCaseOutputDTO } from './dto/create-short-url-usecase-output.dto';
import { CreateShortUrlUseCaseInputDTO } from './dto/create-short-url-usecase-input.dto';

@injectable()
export class CreateShortUrlUseCase {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
  ) {}

  async execute(data: CreateShortUrlUseCaseInputDTO): Promise<CreateShortUrlUseCaseOutputDTO> {
    const urlShortner = new UrlShortener({ originalUrl: data.originalUrl });

    await this.urlShortenerRepository.create(urlShortner);

    return {
      shortUrl: urlShortner.shortUrl,
      originalUrl: urlShortner.originalUrl,
    };
  }
}
