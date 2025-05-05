import 'reflect-metadata';

import { PrismaClient } from '@prisma/client';
import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { UrlShortenerPrismaRepository } from '@/modules/url-shortener/infra/database/prisma/url-shortener-prisma.repository';

const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      urlShortener: {
        findUnique: mockFindUnique,
        findMany: mockFindMany,
        findFirst: mockFindFirst,
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
        where: {
          urlKey: 'abc123',
          deletedAt: null,
        },
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
        deletedAt: null,
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
        where: {
          urlKey: 'abc123',
          deletedAt: null,
        },
      });
    });

    it('should return null when url key is found but record is deleted', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await repository.findByUrlKey('deleted-key');

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          urlKey: 'deleted-key',
          deletedAt: null,
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return an empty array when no URLs are found for the user', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await repository.findByUserId('user-123');

      expect(result).toEqual([]);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return an array of UrlShortener entities when URLs are found for the user', async () => {
      const mockDate = new Date();
      const mockUrlShortenerDataList = [
        {
          id: 'test-id-1',
          urlKey: 'abc123',
          originalUrl: 'https://example.com/1',
          clickCount: 5,
          createdAt: mockDate,
          updatedAt: mockDate,
          deletedAt: null,
        },
        {
          id: 'test-id-2',
          urlKey: 'def456',
          originalUrl: 'https://example.com/2',
          clickCount: 10,
          createdAt: mockDate,
          updatedAt: mockDate,
          deletedAt: null,
        },
      ];

      mockFindMany.mockResolvedValue(mockUrlShortenerDataList);

      const result = await repository.findByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UrlShortener);
      expect(result[0].id).toBe('test-id-1');
      expect(result[0].urlKey).toBe('abc123');
      expect(result[0].originalUrl).toBe('https://example.com/1');
      expect(result[0].clickCount).toBe(5);
      expect(result[1]).toBeInstanceOf(UrlShortener);
      expect(result[1].id).toBe('test-id-2');
      expect(result[1].urlKey).toBe('def456');
      expect(result[1].originalUrl).toBe('https://example.com/2');
      expect(result[1].clickCount).toBe(10);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should not return deleted URLs for the user', async () => {
      const mockDate = new Date();
      const deletedDate = new Date();

      const mockUrlShortenerDataList = [
        {
          id: 'active-id-1',
          urlKey: 'active1',
          originalUrl: 'https://example.com/active1',
          clickCount: 5,
          createdAt: mockDate,
          updatedAt: mockDate,
          deletedAt: null,
        },
        {
          id: 'deleted-id',
          urlKey: 'deleted',
          originalUrl: 'https://example.com/deleted',
          clickCount: 3,
          createdAt: mockDate,
          updatedAt: deletedDate,
          deletedAt: deletedDate,
        },
      ];

      const filteredList = mockUrlShortenerDataList.filter((url) => url.deletedAt === null);
      mockFindMany.mockResolvedValue(filteredList);

      const result = await repository.findByUserId('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('active-id-1');
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
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

  describe('findByUrlKeyAndUserId', () => {
    it('should return null when url key and user id combination is not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await repository.findByUrlKeyAndUserId('abc123', 'user-123');

      expect(result).toBeNull();
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          urlKey: 'abc123',
          userId: 'user-123',
          deletedAt: null,
        },
      });
    });

    it('should return a UrlShortener entity when url key and user id combination is found', async () => {
      const mockDate = new Date();
      const mockUrlShortenerData = {
        id: 'test-id',
        urlKey: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 5,
        createdAt: mockDate,
        updatedAt: mockDate,
        userId: 'user-123',
        deletedAt: null,
      };

      mockFindFirst.mockResolvedValue(mockUrlShortenerData);

      const result = await repository.findByUrlKeyAndUserId('abc123', 'user-123');

      expect(result).toBeInstanceOf(UrlShortener);
      expect(result?.id).toBe('test-id');
      expect(result?.urlKey).toBe('abc123');
      expect(result?.originalUrl).toBe('https://example.com');
      expect(result?.clickCount).toBe(5);
      expect(result?.createdAt).toBe(mockDate);
      expect(result?.updatedAt).toBe(mockDate);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          urlKey: 'abc123',
          userId: 'user-123',
          deletedAt: null,
        },
      });
    });

    it('should return null when url is deleted even if url key and user id match', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await repository.findByUrlKeyAndUserId('abc123', 'user-123');

      expect(result).toBeNull();
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          urlKey: 'abc123',
          userId: 'user-123',
          deletedAt: null,
        },
      });
    });
  });

  describe('delete', () => {
    it('should update the record with deletedAt timestamp', async () => {
      const mockDate = new Date();
      const deletedAt = new Date();
      const urlShortener = new UrlShortener({
        id: 'test-id',
        urlKey: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 10,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      jest.spyOn(urlShortener, 'deletedAt', 'get').mockReturnValue(deletedAt);
      jest.spyOn(urlShortener, 'updatedAt', 'get').mockReturnValue(deletedAt);

      await repository.delete(urlShortener);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          updatedAt: deletedAt,
          deletedAt: deletedAt,
        },
      });
    });

    it('should perform a soft delete by setting deletedAt timestamp', async () => {
      const mockDate = new Date();
      const urlShortener = new UrlShortener({
        id: 'test-id',
        urlKey: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 10,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      urlShortener.delete();

      await repository.delete(urlShortener);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          updatedAt: expect.any(Date),
          deletedAt: expect.any(Date),
        },
      });

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.data.updatedAt).toBe(updateCall.data.deletedAt);
    });
  });
});
