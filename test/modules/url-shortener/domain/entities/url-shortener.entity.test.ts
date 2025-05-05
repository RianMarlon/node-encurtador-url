import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { generateNanoId } from '@/shared/utils/generate-nano-id';
import { BaseEntity } from '@/shared/domain/base-entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock('@/shared/utils/generate-nano-id', () => ({
  generateNanoId: jest.fn(),
}));

jest.mock('@/shared/domain/base-entity');

describe('UrlShortener', () => {
  const mockNanoId = 'abc123';
  const mockId = 'mock-entity-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (generateNanoId as jest.Mock).mockReturnValue(mockNanoId);
    process.env.BASE_URL = 'http://short.url';

    (BaseEntity as jest.Mock).mockImplementation(function (
      this: any,
      id?: string,
      createdAt?: Date,
      updatedAt?: Date,
    ) {
      this.id = id || mockId;
      this.createdAt = createdAt || new Date();
      this.updatedAt = updatedAt || new Date();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create entity with default values when only originalUrl is provided', () => {
      const originalUrl = 'https://example.com/long-url';
      const urlShortener = new UrlShortener({ originalUrl });

      expect(generateNanoId).toHaveBeenCalledTimes(1);
      expect(urlShortener.urlKey).toBe(mockNanoId);
      expect(urlShortener.shortUrl).toBe(`${process.env.BASE_URL}/${mockNanoId}`);
      expect(urlShortener.originalUrl).toBe(originalUrl);
      expect(urlShortener.clickCount).toBe(0);
    });

    it('should create entity with provided urlKey', () => {
      const originalUrl = 'https://example.com/long-url';
      const urlKey = 'custom-key';
      const urlShortener = new UrlShortener({ originalUrl, urlKey });

      expect(generateNanoId).not.toHaveBeenCalled();
      expect(urlShortener.urlKey).toBe(urlKey);
      expect(urlShortener.shortUrl).toBe(`${process.env.BASE_URL}/${urlKey}`);
      expect(urlShortener.originalUrl).toBe(originalUrl);
      expect(urlShortener.clickCount).toBe(0);
    });

    it('should create entity with provided clickCount', () => {
      const originalUrl = 'https://example.com/long-url';
      const clickCount = 10;
      const urlShortener = new UrlShortener({ originalUrl, clickCount });

      expect(urlShortener.clickCount).toBe(clickCount);
    });

    it('should create entity with all provided parameters', () => {
      const id = 'custom-id';
      const urlKey = 'custom-key';
      const originalUrl = 'https://example.com/long-url';
      const clickCount = 5;
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const updatedAt = new Date('2025-02-01T00:00:00Z');

      const urlShortener = new UrlShortener({
        id,
        urlKey,
        originalUrl,
        clickCount,
        createdAt,
        updatedAt,
      });

      expect(BaseEntity).toHaveBeenCalledWith(id, createdAt, updatedAt);
      expect(urlShortener.urlKey).toBe(urlKey);
      expect(urlShortener.shortUrl).toBe(`${process.env.BASE_URL}/${urlKey}`);
      expect(urlShortener.originalUrl).toBe(originalUrl);
      expect(urlShortener.clickCount).toBe(clickCount);
    });

    it('should throw NotificationError when originalUrl is missing', () => {
      expect(() => {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new UrlShortener({});
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with correct error details when originalUrl is missing', () => {
      try {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new UrlShortener({});
        fail('Expected constructor to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Original URL is required');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].context).toBe('UrlShortener');
        expect(errors[0].field).toBe('originalUrl');
      }
    });

    it('should throw NotificationError when originalUrl is not a valid URL', () => {
      expect(() => {
        new UrlShortener({ originalUrl: 'not-a-valid-url' });
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with correct error details when originalUrl is invalid', () => {
      try {
        new UrlShortener({ originalUrl: 'not-a-valid-url' });
        fail('Expected constructor to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Original URL must be a valid URL');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].context).toBe('UrlShortener');
        expect(errors[0].field).toBe('originalUrl');
      }
    });

    it('should throw NotificationError with multiple errors when there are multiple validation issues', () => {
      try {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new UrlShortener({ originalUrl: null });
        fail('Expected constructor to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBeGreaterThan(0);

        errors.forEach((err) => {
          expect(err.code).toBe('BAD_REQUEST');
          expect(err.context).toBe('UrlShortener');
          expect(typeof err.message).toBe('string');
        });
      }
    });

    it('should accept valid URLs with different protocols', () => {
      expect(() => {
        new UrlShortener({ originalUrl: 'http://example.com' });
      }).not.toThrow();

      expect(() => {
        new UrlShortener({ originalUrl: 'https://example.com' });
      }).not.toThrow();

      expect(() => {
        new UrlShortener({ originalUrl: 'ftp://example.com' });
      }).not.toThrow();
    });

    it('should accept valid URLs with query parameters and fragments', () => {
      expect(() => {
        new UrlShortener({
          originalUrl: 'https://example.com/path?param1=value1&param2=value2#section1',
        });
      }).not.toThrow();
    });

    it('should accept valid URLs with ports', () => {
      expect(() => {
        new UrlShortener({ originalUrl: 'https://example.com:8080/path' });
      }).not.toThrow();
    });

    it('should accept valid URLs with authentication', () => {
      expect(() => {
        new UrlShortener({ originalUrl: 'https://user:password@example.com' });
      }).not.toThrow();
    });
  });

  describe('getters', () => {
    it('should return the correct urlKey value', () => {
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com' });
      expect(urlShortener.urlKey).toBe(mockNanoId);
    });

    it('should return the correct shortUrl value', () => {
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com' });
      expect(urlShortener.shortUrl).toBe(`${process.env.BASE_URL}/${mockNanoId}`);
    });

    it('should return the correct originalUrl value', () => {
      const originalUrl = 'https://example.com/long-url';
      const urlShortener = new UrlShortener({ originalUrl });
      expect(urlShortener.originalUrl).toBe(originalUrl);
    });

    it('should return the correct clickCount value', () => {
      const clickCount = 15;
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com', clickCount });
      expect(urlShortener.clickCount).toBe(clickCount);
    });
  });

  describe('incrementClickCount', () => {
    it('should increment the click count by 1', () => {
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com' });
      expect(urlShortener.clickCount).toBe(0);

      urlShortener.incrementClickCount();
      expect(urlShortener.clickCount).toBe(1);

      urlShortener.incrementClickCount();
      expect(urlShortener.clickCount).toBe(2);
    });

    it('should increment the click count from an initial value', () => {
      const initialClickCount = 10;
      const urlShortener = new UrlShortener({
        originalUrl: 'https://example.com',
        clickCount: initialClickCount,
      });

      expect(urlShortener.clickCount).toBe(initialClickCount);

      urlShortener.incrementClickCount();
      expect(urlShortener.clickCount).toBe(initialClickCount + 1);
    });
  });

  describe('changeOriginalUrl', () => {
    it('should update the original URL', () => {
      const initialUrl = 'https://example.com';
      const newUrl = 'https://newexample.com';
      const urlShortener = new UrlShortener({ originalUrl: initialUrl });

      expect(urlShortener.originalUrl).toBe(initialUrl);

      urlShortener.changeOriginalUrl(newUrl);

      expect(urlShortener.originalUrl).toBe(newUrl);
    });

    it('should reset click count to zero when changing the URL', () => {
      const urlShortener = new UrlShortener({
        originalUrl: 'https://example.com',
        clickCount: 10,
      });

      expect(urlShortener.clickCount).toBe(10);

      urlShortener.changeOriginalUrl('https://newexample.com');

      expect(urlShortener.clickCount).toBe(0);
    });

    it('should update the updatedAt timestamp', () => {
      const initialDate = new Date('2025-01-01T00:00:00Z');
      const urlShortener = new UrlShortener({
        originalUrl: 'https://example.com',
        updatedAt: initialDate,
      });

      const newDate = new Date('2025-02-01T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementationOnce(() => newDate as unknown as Date);

      urlShortener.changeOriginalUrl('https://newexample.com');

      expect(urlShortener.updatedAt).toEqual(newDate);
      expect(urlShortener.updatedAt).not.toEqual(initialDate);
    });

    it('should throw NotificationError when new URL is invalid', () => {
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com' });

      expect(() => {
        urlShortener.changeOriginalUrl('invalid-url');
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with correct error details when new URL is invalid', () => {
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com' });

      try {
        urlShortener.changeOriginalUrl('invalid-url');
        fail('Expected changeOriginalUrl to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Original URL must be a valid URL');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].context).toBe('UrlShortener');
        expect(errors[0].field).toBe('originalUrl');
      }
    });
  });

  describe('delete', () => {
    it('should set deletedAt to current date', () => {
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com' });
      expect(urlShortener.deletedAt).toBeNull();

      const mockDate = new Date('2025-03-01T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementationOnce(() => mockDate as unknown as Date);

      urlShortener.delete();

      expect(urlShortener.deletedAt).toEqual(mockDate);
    });

    it('should update the updatedAt timestamp when deleting', () => {
      const initialDate = new Date('2025-01-01T00:00:00Z');
      const urlShortener = new UrlShortener({
        originalUrl: 'https://example.com',
        updatedAt: initialDate,
      });

      const mockDate = new Date('2025-03-01T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementationOnce(() => mockDate as unknown as Date);

      urlShortener.delete();

      expect(urlShortener.updatedAt).toEqual(mockDate);
      expect(urlShortener.updatedAt).not.toEqual(initialDate);
    });

    it('should set deletedAt and updatedAt to the same timestamp', () => {
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com' });

      const mockDate = new Date('2025-03-01T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementationOnce(() => mockDate as unknown as Date);

      urlShortener.delete();

      expect(urlShortener.deletedAt).toEqual(urlShortener.updatedAt);
    });
  });

  describe('constructor with deletedAt', () => {
    it('should create entity with provided deletedAt', () => {
      const deletedAt = new Date('2025-03-01T00:00:00Z');
      const urlShortener = new UrlShortener({
        originalUrl: 'https://example.com',
        deletedAt,
      });

      expect(urlShortener.deletedAt).toEqual(deletedAt);
    });

    it('should set deletedAt to null when not provided', () => {
      const urlShortener = new UrlShortener({ originalUrl: 'https://example.com' });
      expect(urlShortener.deletedAt).toBeNull();
    });
  });
});
