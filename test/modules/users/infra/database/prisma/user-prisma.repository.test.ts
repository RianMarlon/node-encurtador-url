import 'reflect-metadata';

import { PrismaClient } from '@prisma/client';
import { User } from '@/modules/users/domain/entities/user.entity';
import { UserPrismaRepository } from '@/modules/users/infra/database/prisma/user-prisma.repository';

const mockFindFirst = jest.fn();
const mockCreate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findFirst: mockFindFirst,
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
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockFindFirst.mockResolvedValue(mockUserData);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-id');
      expect(result?.name).toBe('Test User');
      expect(result?.email).toBe('test@example.com');
      expect(result?.password).toBe('hashed_password');
      expect(result?.createdAt).toBe(mockDate);
      expect(result?.updatedAt).toBe(mockDate);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user record', async () => {
      const mockDate = new Date();
      const user = new User({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      await repository.create(user);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          id: 'user-id',
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
