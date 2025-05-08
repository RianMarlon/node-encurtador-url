import { BaseEntity } from '@/shared/domain/base-entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { generateNanoId } from '@/shared/utils/generate-nano-id';

interface UrlShortenerProps {
  id?: string;
  urlKey?: string;
  originalUrl: string;
  clickCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class UrlShortener extends BaseEntity {
  private _urlKey: string;
  private _shortUrl: string;
  private _originalUrl: string;
  private _clickCount: number;
  private _deletedAt: Date | null;

  constructor(props: UrlShortenerProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.validate(props);
    this._urlKey = props.urlKey || generateNanoId();
    this._shortUrl = `${process.env.BASE_URL}/${this._urlKey}`;
    this._originalUrl = props.originalUrl;
    this._clickCount = props.clickCount || 0;
    this._deletedAt = props.deletedAt || null;
  }

  private validate(props: UrlShortenerProps): void {
    const notification = new NotificationError();

    if (!props.originalUrl) {
      notification.addError({
        message: 'Original URL is required',
        code: 'BAD_REQUEST',
        context: 'UrlShortener',
        field: 'originalUrl',
      });
    } else {
      try {
        new URL(props.originalUrl);
      } catch {
        notification.addError({
          message: 'Original URL must be a valid URL',
          code: 'BAD_REQUEST',
          context: 'UrlShortener',
          field: 'originalUrl',
        });
      }
    }

    if (notification.hasErrors()) {
      throw notification;
    }
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

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  changeOriginalUrl(originalUrl: string): void {
    if (this._deletedAt) {
      throw new NotificationError([
        {
          message: 'This URL has been deleted',
          code: 'BAD_REQUEST',
          context: 'UrlShortener',
          field: 'originalUrl',
        },
      ]);
    }
    this.validate({ originalUrl });
    this._originalUrl = originalUrl;
    this._clickCount = 0;
    this.updatedAt = new Date();
  }

  incrementClickCount(): void {
    if (this._deletedAt) {
      throw new NotificationError([
        {
          message: 'This URL has been deleted',
          code: 'BAD_REQUEST',
          context: 'UrlShortener',
          field: 'originalUrl',
        },
      ]);
    }
    this._clickCount++;
  }

  delete(): void {
    const now = new Date();
    this._deletedAt = now;
    this.updatedAt = now;
  }
}
