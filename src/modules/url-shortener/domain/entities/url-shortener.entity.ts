import { BaseEntity } from '@/shared/domain/base-entity';
import { generateNanoId } from '@/shared/utils/generate-nano-id';

interface UrlShortenerProps {
  id?: string;
  urlKey?: string;
  originalUrl: string;
  clickCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UrlShortener extends BaseEntity {
  private _urlKey: string;

  private _shortUrl: string;

  private _originalUrl: string;

  private _clickCount: number;

  constructor(props: UrlShortenerProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._urlKey = props.urlKey || generateNanoId();
    this._shortUrl = `${process.env.BASE_URL}/${this._urlKey}`;
    this._originalUrl = props.originalUrl;
    this._clickCount = props.clickCount || 0;
  }

  get urlKey(): string {
    return this._urlKey;
  }

  get shortUrl(): string {
    return this._shortUrl;
  }

  get originalUrl(): string {
    return this._originalUrl;
  }

  get clickCount(): number {
    return this._clickCount;
  }

  incrementClickCount(): void {
    this._clickCount++;
  }
}
