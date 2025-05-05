import { UrlShortener } from '../entities/url-shortener.entity';

export interface UrlShortenerRepository {
  findByUrlKey(urlKey: string): Promise<UrlShortener | null>;
  create(entity: UrlShortener, userId?: string): Promise<void>;
  update(entity: UrlShortener): Promise<void>;
}
