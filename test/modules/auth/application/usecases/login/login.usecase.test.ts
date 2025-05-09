import 'reflect-metadata';
import { LoginUseCase } from '@/modules/auth/application/usecases/login/login.usecase';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { HashProvider } from '@/shared/providers/hash/interfaces/hash-provider.interface';
import { JwtProvider } from '@/shared/providers/jwt/interfaces/jwt-provider.interface';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { User } from '@/modules/user/domain/entities/user.entity';

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
} as jest.Mocked<UserRepository>;

const mockHashProvider = {
  hash: jest.fn(),
  compare: jest.fn(),
} as jest.Mocked<HashProvider>;

const mockJwtProvider = {
  generate: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
} as jest.Mocked<JwtProvider>;

jest.mock('@/modules/user/domain/entities/user.entity');

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  const mockUserId = 'user-123';
  const mockUserName = 'Test User';
  const mockUserEmail = 'test@example.com';
  const mockUserPassword = 'hashed_password';
  const mockInputPassword = 'password123';
  const mockToken = 'mock.jwt.token';

  const mockUser = {
    id: mockUserId,
    name: mockUserName,
    email: mockUserEmail,
    password: mockUserPassword,
  } as unknown as User;

  beforeEach(() => {
    jest.clearAllMocks();

    loginUseCase = new LoginUseCase(mockUserRepository, mockHashProvider, mockJwtProvider);
  });

  it('should authenticate a user and return access token', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockHashProvider.compare.mockResolvedValueOnce(true);
    mockJwtProvider.generate.mockResolvedValueOnce(mockToken);

    const input = {
      email: mockUserEmail,
      password: mockInputPassword,
    };

    const result = await loginUseCase.execute(input);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUserEmail.toLowerCase());
    expect(mockHashProvider.compare).toHaveBeenCalledWith(mockInputPassword, mockUserPassword);
    expect(mockJwtProvider.generate).toHaveBeenCalledWith({
      sub: mockUserId,
      name: mockUserName,
      email: mockUserEmail,
    });

    expect(result).toEqual({
      accessToken: mockToken,
    });
  });

  it('should throw NotificationError when user is not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);

    const input = {
      email: 'nonexistent@example.com',
      password: mockInputPassword,
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(NotificationError);

    try {
      await loginUseCase.execute(input);
    } catch (error) {
      const notificationError = error as NotificationError;
      const errors = notificationError.getErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        message: 'Invalid email or password',
        code: 'UNAUTHORIZED',
      });
    }

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    expect(mockHashProvider.compare).not.toHaveBeenCalled();
    expect(mockJwtProvider.generate).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when password does not match', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockHashProvider.compare.mockResolvedValueOnce(false);

    const input = {
      email: mockUserEmail,
      password: 'wrong_password',
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(NotificationError);

    try {
      await loginUseCase.execute(input);
    } catch (error) {
      const notificationError = error as NotificationError;
      const errors = notificationError.getErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        message: 'Invalid email or password',
        code: 'UNAUTHORIZED',
      });
    }

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUserEmail.toLowerCase());
    expect(mockHashProvider.compare).toHaveBeenCalledWith('wrong_password', mockUserPassword);
    expect(mockJwtProvider.generate).not.toHaveBeenCalled();
  });

  it('should handle null email by converting to lowercase', async () => {
    const input = {
      email: null as unknown as string,
      password: mockInputPassword,
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(TypeError);

    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should handle uppercase email by converting to lowercase', async () => {
    const uppercaseEmail = 'TEST@EXAMPLE.COM';
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockHashProvider.compare.mockResolvedValueOnce(true);
    mockJwtProvider.generate.mockResolvedValueOnce(mockToken);

    const input = {
      email: uppercaseEmail,
      password: mockInputPassword,
    };

    const result = await loginUseCase.execute(input);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(uppercaseEmail.toLowerCase());
    expect(result).toEqual({ accessToken: mockToken });
  });

  it('should handle errors from JWT generation', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockHashProvider.compare.mockResolvedValueOnce(true);

    const jwtError = new Error('JWT generation failed');
    mockJwtProvider.generate.mockRejectedValueOnce(jwtError);

    const input = {
      email: mockUserEmail,
      password: mockInputPassword,
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(jwtError);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUserEmail.toLowerCase());
    expect(mockHashProvider.compare).toHaveBeenCalledWith(mockInputPassword, mockUserPassword);
    expect(mockJwtProvider.generate).toHaveBeenCalled();
  });
});
