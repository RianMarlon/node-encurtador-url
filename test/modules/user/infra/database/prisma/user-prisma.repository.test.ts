import 'reflect-metadata';

import { PrismaClient } from '@prisma/client';
import { User } from '@/modules/user/domain/entities/user.entity';
import { UserPrismaRepository } from '@/modules/user/infra/database/prisma/user-prisma.repository';

const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findFirst: mockFindFirst,
        findUnique: mockFindUnique,
        create: mockCreate,
      },
    })),
  };
});

describe('UserPrismaRepository', () => {
  let repository: UserPrismaRepository;
  let prismaClient: PrismaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaClient = new PrismaClient();
    repository = new UserPrismaRepository(prismaClient);
  });

  describe('findByEmail', () => {
    it('should return null when email is not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeNull();
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return a User entity when email is found', async () => {
      const mockDate = new Date();
      const mockUserData = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockFindFirst.mockResolvedValue(mockUserData);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('test-id');
      expect(result?.name).toBe('Test User');
      expect(result?.email).toBe('test@example.com');
      expect(result?.password).toBe('hashed_password');
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('findById', () => {
    it('should return null when user id is not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should return a User entity when user id is found', async () => {
      const mockDate = new Date();
      const mockUserData = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockFindUnique.mockResolvedValue(mockUserData);

      const result = await repository.findById('test-id');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('test-id');
      expect(result?.name).toBe('Test User');
      expect(result?.email).toBe('test@example.com');
      expect(result?.password).toBe('hashed_password');
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user record', async () => {
      const mockDate = new Date();
      const user = new User({
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      await repository.create(user);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          id: 'test-id',
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed_password',
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      });
    });
  });
});
