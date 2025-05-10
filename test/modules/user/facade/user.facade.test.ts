import 'reflect-metadata';

import { User } from '@/modules/user/domain/entities/user.entity';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { UserFacade } from '@/modules/user/facade/user.facade';

describe('UserFacade', () => {
  let userFacade: UserFacade;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockDate = new Date();
  const mockUser = {
    id: 'mock-user-id',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    createdAt: mockDate,
    updatedAt: mockDate,
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    userFacade = new UserFacade(mockUserRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findById', () => {
    it('should return user data when user is found', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(mockUser);

      const result = await userFacade.findById({ id: 'mock-user-id' });

      expect(mockUserRepository.findById).toHaveBeenCalledWith('mock-user-id');
      expect(result).toEqual({
        id: 'mock-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should return null when user is not found by id', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null);

      const result = await userFacade.findById({ id: 'non-existent-id' });

      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });

    it('should propagate errors from userRepository.findById', async () => {
      const mockError = new Error('Database error');
      mockUserRepository.findById.mockRejectedValueOnce(mockError);

      await expect(userFacade.findById({ id: 'mock-user-id' })).rejects.toThrow('Database error');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('mock-user-id');
    });
  });

  describe('findByEmail', () => {
    it('should return user data when user is found by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);

      const result = await userFacade.findByEmail({ email: 'john@example.com' });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(result).toEqual({
        id: 'mock-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should return null when user is not found by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);

      const result = await userFacade.findByEmail({ email: 'nonexistent@example.com' });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should propagate errors from userRepository.findByEmail', async () => {
      const mockError = new Error('Database error');
      mockUserRepository.findByEmail.mockRejectedValueOnce(mockError);

      await expect(userFacade.findByEmail({ email: 'john@example.com' })).rejects.toThrow(
        'Database error',
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    });
  });
});
