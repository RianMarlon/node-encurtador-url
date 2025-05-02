import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { generateNanoId } from '@/shared/utils/generate-nano-id';
import { BaseEntity } from '@/shared/domain/base-entity';

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
});
