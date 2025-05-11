import { inject, injectable } from 'tsyringe';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { DeleteShortUrlByUrlKeyUseCaseInputDTO } from './dto/delete-short-url-by-url-key-usecase-input.dto';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import UseCaseInterface from '@/shared/application/use-case.interface';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

@injectable()
export class DeleteShortUrlByUrlKeyUseCase implements UseCaseInterface {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
    @inject('LoggerProvider')
    private readonly logger: LoggerProvider,
  ) {}

  async execute({ urlKey, userId }: DeleteShortUrlByUrlKeyUseCaseInputDTO): Promise<void> {
    this.logger.debug(
      `Checking if the short URL with key ${urlKey} exists and belongs to the user with id ${userId} to delete it`,
    );
    const urlShortener = await this.urlShortenerRepository.findByUrlKeyAndUserId(urlKey, userId);
    if (!urlShortener) {
      this.logger.warn(`URL with key ${urlKey} not found or does not belong to the user ${userId}`);
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

    this.logger.info(
      `Short URL with key "${urlKey}" belonging to user with ID "${userId}" deleted successfully.`,
    );
  }
}
