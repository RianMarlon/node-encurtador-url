import { inject, injectable } from 'tsyringe';

import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { DeleteShortUrlByUrlKeyUseCaseInputDTO } from './dto/delete-short-url-by-url-key-usecase-input.dto';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import UseCaseInterface from '@/shared/application/use-case.interface';

@injectable()
export class DeleteShortUrlByUrlKeyUseCase implements UseCaseInterface {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: UserRepository,
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
  ) {}

  async execute({ urlKey, userId }: DeleteShortUrlByUrlKeyUseCaseInputDTO): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotificationError([
        {
          message: 'User not found',
          code: 'NOT_FOUND',
          context: 'DeleteShortUrlByUrlKey',
        },
      ]);
    }

    const urlShortener = await this.urlShortenerRepository.findByUrlKeyAndUserId(urlKey, userId);

    if (!urlShortener) {
      throw new NotificationError([
        {
          message: 'URL not found or does not belong to the user',
          code: 'NOT_FOUND',
          context: 'DeleteShortUrlByUrlKey',
        },
      ]);
    }

    urlShortener.delete();
    await this.urlShortenerRepository.delete(urlShortener);
  }
}
