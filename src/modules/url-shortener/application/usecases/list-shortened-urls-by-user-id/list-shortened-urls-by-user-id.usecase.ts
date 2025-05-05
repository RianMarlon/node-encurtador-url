import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { ListShortenedUrlsByUserIdUseCaseInputDTO } from './dto/list-shortened-urls-by-user-id-usecase-input.dto';
import { ListShortenedUrlsByUserIdUseCaseOutputDTO } from './dto/list-shortened-urls-by-user-id-usecase-output.dto';

@injectable()
export class ListShortenedUrlsByUserIdUseCase {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
    @inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    userId,
  }: ListShortenedUrlsByUserIdUseCaseInputDTO): Promise<ListShortenedUrlsByUserIdUseCaseOutputDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotificationError([
        {
          message: 'User not found',
          code: 'UNAUTHORIZED',
        },
      ]);
    }

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
