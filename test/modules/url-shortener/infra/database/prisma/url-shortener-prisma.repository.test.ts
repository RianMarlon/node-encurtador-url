import 'reflect-metadata';

import { PrismaClient } from '@prisma/client';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { UrlShortenerPrismaRepository } from '@/modules/url-shortener/infra/database/prisma/url-shortener-prisma.repository';

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      urlShortener: {
        findUnique: mockFindUnique,
        create: mockCreate,
        update: mockUpdate,
      },
    })),
  };
});

describe('UrlShortenerPrismaRepository', () => {
  let repository: UrlShortenerPrismaRepository;
  let prismaClient: PrismaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaClient = new PrismaClient();
    repository = new UrlShortenerPrismaRepository(prismaClient);
  });

  describe('findByUrlKey', () => {
    it('should return null when url key is not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await repository.findByUrlKey('abc123');

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { urlKey: 'abc123' },
      });
    });

    it('should return a UrlShortener entity when url key is found', async () => {
      const mockDate = new Date();
      const mockUrlShortenerData = {
        id: 'test-id',
        urlKey: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 5,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockFindUnique.mockResolvedValue(mockUrlShortenerData);

      const result = await repository.findByUrlKey('abc123');

      expect(result).toBeInstanceOf(UrlShortener);
      expect(result?.id).toBe('test-id');
      expect(result?.urlKey).toBe('abc123');
      expect(result?.originalUrl).toBe('https://example.com');
      expect(result?.clickCount).toBe(5);
      expect(result?.createdAt).toBe(mockDate);
      expect(result?.updatedAt).toBe(mockDate);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { urlKey: 'abc123' },
      });
    });
  });

  describe('create', () => {
    it('should create a new url shortener record without userId', async () => {
      const mockDate = new Date();
      const urlShortener = new UrlShortener({
        id: 'test-id',
        urlKey: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 0,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      await repository.create(urlShortener);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          id: 'test-id',
          urlKey: 'abc123',
          originalUrl: 'https://example.com',
          clickCount: 0,
          createdAt: mockDate,
          updatedAt: mockDate,
          userId: null,
        },
      });
    });

    it('should create a new url shortener record with userId', async () => {
      const mockDate = new Date();
      const urlShortener = new UrlShortener({
        id: 'test-id',
        urlKey: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 0,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
      const userId = 'user-123';

      await repository.create(urlShortener, userId);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          id: 'test-id',
          urlKey: 'abc123',
          originalUrl: 'https://example.com',
          clickCount: 0,
          createdAt: mockDate,
          updatedAt: mockDate,
          userId,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing url shortener record', async () => {
      const mockDate = new Date();
      const urlShortener = new UrlShortener({
        id: 'test-id',
        urlKey: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 10,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      await repository.update(urlShortener);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          originalUrl: 'https://example.com',
          clickCount: 10,
          updatedAt: mockDate,
        },
      });
    });
  });
});
