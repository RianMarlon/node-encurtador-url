import 'reflect-metadata';

import { CreateUserUseCase } from '@/modules/user/application/usecases/create-user/create-user.usecase';
import { CreateUserUseCaseInputDTO } from '@/modules/user/application/usecases/create-user/dto/create-user-usecase-input.dto';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { HashProvider } from '@/shared/providers/hash/interfaces/hash-provider.interface';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { User } from '@/modules/user/domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockHashProvider: jest.Mocked<HashProvider>;

  const mockUser = {
    id: 'mock-user-id',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockInputData: CreateUserUseCaseInputDTO = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockHashProvider = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<HashProvider>;

    createUserUseCase = new CreateUserUseCase(mockUserRepository, mockHashProvider);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a new user successfully', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockHashProvider.hash.mockResolvedValueOnce('hashed_password');

    const result = await createUserUseCase.execute(mockInputData);

    expect(mockHashProvider.hash).toHaveBeenCalledWith(mockInputData.password);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);

    expect(result.id).toBeDefined();
    expect(result.name).toBe(mockInputData.name);
    expect(result.email).toBe(mockInputData.email);
    expect(result.createdAt).toBeDefined();
  });

  it('should throw NotificationError when user already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);

    await expect(createUserUseCase.execute(mockInputData)).rejects.toThrow(NotificationError);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should propagate errors from userRepository.create', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockHashProvider.hash.mockResolvedValueOnce('hashed_password');

    const mockError = new Error('Database error');
    mockUserRepository.create.mockRejectedValueOnce(mockError);

    await expect(createUserUseCase.execute(mockInputData)).rejects.toThrow('Database error');

    expect(mockHashProvider.hash).toHaveBeenCalledWith(mockInputData.password);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from hashProvider.hash', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    const mockError = new Error('Hash error');
    mockHashProvider.hash.mockRejectedValueOnce(mockError);

    await expect(createUserUseCase.execute(mockInputData)).rejects.toThrow('Hash error');

    expect(mockHashProvider.hash).toHaveBeenCalledWith(mockInputData.password);
    expect(mockUserRepository.findByEmail).toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should include correct error details when user already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);

    try {
      await createUserUseCase.execute(mockInputData);
    } catch (error) {
      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'User already exists',
        code: 'BAD_REQUEST',
      });
    }

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
