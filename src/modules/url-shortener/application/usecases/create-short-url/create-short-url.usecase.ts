import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { CreateShortUrlUseCaseOutputDTO } from './dto/create-short-url-usecase-output.dto';
import { CreateShortUrlUseCaseInputDTO } from './dto/create-short-url-usecase-input.dto';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { NotificationError } from '@/shared/domain/errors/notification-error';

@injectable()
export class CreateShortUrlUseCase {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
    @inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(data: CreateShortUrlUseCaseInputDTO): Promise<CreateShortUrlUseCaseOutputDTO> {
    const urlShortner = new UrlShortener({ originalUrl: data.originalUrl });

    if (data.userId) {
      const user = await this.userRepository.findById(data.userId);

      if (!user) {
        throw new NotificationError([
          {
            message: 'User not found',
            code: 'UNAUTHORIZED',
          },
        ]);
      }
    }

    await this.urlShortenerRepository.create(urlShortner, data.userId);

    return {
      urlKey: urlShortner.urlKey,
      shortUrl: urlShortner.shortUrl,
      originalUrl: urlShortner.originalUrl,
    };
  }
}
