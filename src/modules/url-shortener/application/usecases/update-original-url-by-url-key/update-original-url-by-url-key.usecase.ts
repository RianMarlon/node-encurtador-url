import { inject, injectable } from 'tsyringe';

import { NotificationError } from '@/shared/domain/errors/notification-error';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UpdateOriginalUrlByUrlKeyUseCaseInputDTO } from './dto/update-original-url-by-url-key-usecase-input.dto';
import { UpdateOriginalUrlByUrlKeyUseCaseOutputDTO } from './dto/update-original-url-by-url-key-usecase-output.dto';
import UseCaseInterface from '@/shared/application/use-case.interface';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

@injectable()
export class UpdateOriginalUrlByUrlKeyUseCase implements UseCaseInterface {
  constructor(
    @inject('UrlShortenerRepository')
    private readonly urlShortenerRepository: UrlShortenerRepository,
    @inject('LoggerProvider')
    private readonly logger: LoggerProvider,
  ) {}

  async execute({
    urlKey,
    originalUrl,
    userId,
  }: UpdateOriginalUrlByUrlKeyUseCaseInputDTO): Promise<UpdateOriginalUrlByUrlKeyUseCaseOutputDTO> {
    this.logger.debug(
      `Checking if the short URL with key ${urlKey} exists and belongs to the user with id ${userId} to update it`,
    );
    const urlShortener = await this.urlShortenerRepository.findByUrlKeyAndUserId(urlKey, userId);
    if (!urlShortener) {
      this.logger.warn(`URL with key ${urlKey} not found or does not belong to user ${userId}.`);
      throw new NotificationError([
        {
          message: 'URL not found or does not belong to this user',
          code: 'NOT_FOUND',
          context: 'UpdateOriginalUrlByUrlKey',
        },
      ]);
    }

    this.logger.debug(
      `Changing original URL for key ${urlKey} from ${urlShortener.originalUrl} to ${originalUrl} - User ID: ${userId}`,
    );
    urlShortener.changeOriginalUrl(originalUrl);

    await this.urlShortenerRepository.update(urlShortener);
    this.logger.info(`Original URL updated successfully for key ${urlKey} by user ${userId}`);

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
