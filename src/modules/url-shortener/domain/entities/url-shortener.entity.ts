import { BaseEntity } from '@/shared/domain/base-entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { generateNanoId } from '@/shared/utils/generate-nano-id';
import * as yup from 'yup';

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
    this.validate(props);
    this._urlKey = props.urlKey || generateNanoId();
    this._shortUrl = `${process.env.BASE_URL}/${this._urlKey}`;
    this._originalUrl = props.originalUrl;
    this._clickCount = props.clickCount || 0;
  }

  private validate(props: UrlShortenerProps): void {
    const schema = yup.object().shape({
      originalUrl: yup
        .string()
        .url('Original URL must be a valid URL')
        .required('Original URL is required'),
    });

    try {
      schema.validateSync(props, { abortEarly: false });
    } catch (err: any) {
      const notification = new NotificationError();

      err.inner.forEach((validationError: yup.ValidationError) => {
        notification.addError({
          message: validationError.message,
          code: 'BAD_REQUEST',
          context: 'UrlShortener',
          field: validationError.path,
        });
      });

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

  changeOriginalUrl(originalUrl: string): void {
    this.validate({ originalUrl });
    this._originalUrl = originalUrl;
    this._clickCount = 0;
    this.updatedAt = new Date();
  }

  incrementClickCount(): void {
    this._clickCount++;
  }
}
