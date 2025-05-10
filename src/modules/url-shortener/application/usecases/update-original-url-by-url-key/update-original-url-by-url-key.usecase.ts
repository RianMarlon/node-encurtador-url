import { inject, injectable } from 'tsyringe';

import { NotificationError } from '@/shared/domain/errors/notification-error';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UpdateOriginalUrlByUrlKeyUseCaseInputDTO } from './dto/update-original-url-by-url-key-usecase-input.dto';
import { UpdateOriginalUrlByUrlKeyUseCaseOutputDTO } from './dto/update-original-url-by-url-key-usecase-output.dto';
import UseCaseInterface from '@/shared/application/use-case.interface';

@injectable()
export class UpdateOriginalUrlByUrlKeyUseCase implements UseCaseInterface {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
  ) {}

  async execute({
    urlKey,
    originalUrl,
    userId,
  }: UpdateOriginalUrlByUrlKeyUseCaseInputDTO): Promise<UpdateOriginalUrlByUrlKeyUseCaseOutputDTO> {
    const urlShortener = await this.urlShortenerRepository.findByUrlKeyAndUserId(urlKey, userId);
    if (!urlShortener) {
      throw new NotificationError([
        {
          message: 'URL not found or does not belong to this user',
          code: 'NOT_FOUND',
          context: 'UpdateOriginalUrlByUrlKey',
        },
      ]);
    }

    urlShortener.changeOriginalUrl(originalUrl);

    await this.urlShortenerRepository.update(urlShortener);

    return {
      urlKey: urlShortener.urlKey,
      shortUrl: urlShortener.shortUrl,
      originalUrl: urlShortener.originalUrl,
      clickCount: urlShortener.clickCount,
      createdAt: urlShortener.createdAt,
      updatedAt: urlShortener.updatedAt,
    };
  }
}
