import { inject, injectable } from 'tsyringe';

import { NotificationError } from '@/shared/domain/errors/notification-error';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UpdateOriginalUrlByUrlKeyUseCaseInputDTO } from './dto/update-original-url-by-url-key-usecase-input.dto';
import { UpdateOriginalUrlByUrlKeyUseCaseOutputDTO } from './dto/update-original-url-by-url-key-usecase-output.dto';

@injectable()
export class UpdateOriginalUrlByUrlKeyUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: UserRepository,
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
  ) {}

  async execute({
    urlKey,
    originalUrl,
    userId,
  }: UpdateOriginalUrlByUrlKeyUseCaseInputDTO): Promise<UpdateOriginalUrlByUrlKeyUseCaseOutputDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotificationError([
        {
          message: 'User not found',
          code: 'UNAUTHORIZED',
          context: 'UpdateOriginalUrlByUrlKey',
        },
      ]);
    }

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
