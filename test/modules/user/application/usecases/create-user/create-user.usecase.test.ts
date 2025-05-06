import 'reflect-metadata';

import { CreateUserUseCase } from '@/modules/user/application/usecases/create-user/create-user.usecase';
import { CreateUserUseCaseInputDTO } from '@/modules/user/application/usecases/create-user/dto/create-user-usecase-input.dto';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { HashProvider } from '@/shared/providers/hash/interfaces/hash-provider.interface';
import { User } from '@/modules/user/domain/entities/user.entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

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
    email: 'John@Example.com',
    password: 'password123',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockHashProvider = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<HashProvider>;

    createUserUseCase = new CreateUserUseCase(mockUserRepository, mockHashProvider);

    jest.spyOn(User.prototype, 'id', 'get').mockReturnValue(mockUser.id);
    jest.spyOn(User.prototype, 'name', 'get').mockReturnValue(mockUser.name);
    jest.spyOn(User.prototype, 'email', 'get').mockReturnValue(mockUser.email);
    jest.spyOn(User.prototype, 'createdAt', 'get').mockReturnValue(mockUser.createdAt);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a new user successfully', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockHashProvider.hash.mockResolvedValueOnce('hashed_password');

    const result = await createUserUseCase.execute(mockInputData);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockHashProvider.hash).toHaveBeenCalledWith(mockInputData.password);
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    });
  });

  it('should throw NotificationError when user already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);

    await expect(createUserUseCase.execute(mockInputData)).rejects.toThrow(NotificationError);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockHashProvider.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should convert email to lowercase before checking if user exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockHashProvider.hash.mockResolvedValueOnce('hashed_password');

    const inputWithMixedCaseEmail: CreateUserUseCaseInputDTO = {
      name: 'John Doe',
      email: 'JOHN@EXAMPLE.COM',
      password: 'password123',
    };

    await createUserUseCase.execute(inputWithMixedCaseEmail);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
  });

  it('should hash the password before creating the user', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockHashProvider.hash.mockResolvedValueOnce('hashed_password');

    await createUserUseCase.execute(mockInputData);

    expect(mockHashProvider.hash).toHaveBeenCalledWith(mockInputData.password);
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should handle null email gracefully', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockHashProvider.hash.mockResolvedValueOnce('hashed_password');

    const inputWithNullEmail = {
      ...mockInputData,
      email: null as unknown as string,
    };

    await expect(createUserUseCase.execute(inputWithNullEmail)).rejects.toThrow();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should propagate errors from userRepository.create', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockHashProvider.hash.mockResolvedValueOnce('hashed_password');

    const mockError = new Error('Database error');
    mockUserRepository.create.mockRejectedValueOnce(mockError);

    await expect(createUserUseCase.execute(mockInputData)).rejects.toThrow('Database error');

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockHashProvider.hash).toHaveBeenCalledWith(mockInputData.password);
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from hashProvider.hash', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);

    const mockError = new Error('Hash error');
    mockHashProvider.hash.mockRejectedValueOnce(mockError);

    await expect(createUserUseCase.execute(mockInputData)).rejects.toThrow('Hash error');

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockHashProvider.hash).toHaveBeenCalledWith(mockInputData.password);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should include correct error details when user already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);

    try {
      await createUserUseCase.execute(mockInputData);
      fail('Expected execute to throw NotificationError');
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);
      const notificationError = error as NotificationError;

      expect(notificationError.hasErrors()).toBe(true);

      const errors = notificationError.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe('User already exists');
      expect(errors[0].code).toBe('BAD_REQUEST');
    }
  });
});
