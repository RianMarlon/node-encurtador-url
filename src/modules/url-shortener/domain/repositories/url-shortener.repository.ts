import { UrlShortener } from '../entities/url-shortener.entity';

export interface UrlShortenerRepository {
  findByUserId(userId: string): Promise<UrlShortener[]>;
  findByUrlKey(urlKey: string): Promise<UrlShortener | null>;
  findByUrlKeyAndUserId(urlKey: string, userId: string): Promise<UrlShortener | null>;
  create(entity: UrlShortener, userId?: string): Promise<void>;
  update(entity: UrlShortener): Promise<void>;
}
