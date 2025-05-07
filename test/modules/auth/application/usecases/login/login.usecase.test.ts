import 'reflect-metadata';
import { LoginUseCase } from '@/modules/auth/application/usecases/login/login.usecase';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { HashProvider } from '@/shared/providers/hash/interfaces/hash-provider.interface';
import { JwtProvider } from '@/shared/providers/jwt/interfaces/jwt-provider.interface';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { User } from '@/modules/user/domain/entities/user.entity';
import { LoginValidator } from '@/modules/auth/domain/validators/login-validator';

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

const mockLoginValidator = {
  validate: jest.fn(),
} as jest.Mocked<LoginValidator>;

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

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockHashProvider,
      mockJwtProvider,
      mockLoginValidator,
    );
  });

  it('should authenticate a user and return access token', async () => {
    mockLoginValidator.validate.mockResolvedValueOnce();
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockHashProvider.compare.mockResolvedValueOnce(true);
    mockJwtProvider.generate.mockResolvedValueOnce(mockToken);

    const input = {
      email: mockUserEmail,
      password: mockInputPassword,
    };

    const result = await loginUseCase.execute(input);

    expect(mockLoginValidator.validate).toHaveBeenCalledWith(input);
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
    mockLoginValidator.validate.mockResolvedValueOnce();
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

    expect(mockLoginValidator.validate).toHaveBeenCalledWith(input);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    expect(mockHashProvider.compare).not.toHaveBeenCalled();
    expect(mockJwtProvider.generate).not.toHaveBeenCalled();
  });

  it('should throw NotificationError when password does not match', async () => {
    mockLoginValidator.validate.mockResolvedValueOnce();
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

    expect(mockLoginValidator.validate).toHaveBeenCalledWith(input);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUserEmail.toLowerCase());
    expect(mockHashProvider.compare).toHaveBeenCalledWith('wrong_password', mockUserPassword);
    expect(mockJwtProvider.generate).not.toHaveBeenCalled();
  });

  it('should handle null email by converting to lowercase', async () => {
    mockLoginValidator.validate.mockResolvedValueOnce();

    const input = {
      email: null as unknown as string,
      password: mockInputPassword,
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(TypeError);

    expect(mockLoginValidator.validate).toHaveBeenCalledWith(input);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should handle uppercase email by converting to lowercase', async () => {
    mockLoginValidator.validate.mockResolvedValueOnce();
    const uppercaseEmail = 'TEST@EXAMPLE.COM';
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockHashProvider.compare.mockResolvedValueOnce(true);
    mockJwtProvider.generate.mockResolvedValueOnce(mockToken);

    const input = {
      email: uppercaseEmail,
      password: mockInputPassword,
    };

    const result = await loginUseCase.execute(input);

    expect(mockLoginValidator.validate).toHaveBeenCalledWith(input);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(uppercaseEmail.toLowerCase());
    expect(result).toEqual({ accessToken: mockToken });
  });

  it('should propagate validation errors from validator', async () => {
    const validationError = new NotificationError([
      {
        message: 'Email must be a valid email',
        code: 'BAD_REQUEST',
        field: 'email',
      },
    ]);

    mockLoginValidator.validate
      .mockRejectedValueOnce(validationError)
      .mockRejectedValueOnce(validationError);

    const input = {
      email: 'invalid-email',
      password: mockInputPassword,
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(NotificationError);

    await expect(loginUseCase.execute(input)).rejects.toBe(validationError);

    expect(mockLoginValidator.validate).toHaveBeenCalledWith(input);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockHashProvider.compare).not.toHaveBeenCalled();
    expect(mockJwtProvider.generate).not.toHaveBeenCalled();
  });

  it('should validate input before checking user existence', async () => {
    mockLoginValidator.validate.mockResolvedValueOnce();
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockHashProvider.compare.mockResolvedValueOnce(true);
    mockJwtProvider.generate.mockResolvedValueOnce(mockToken);

    const input = {
      email: mockUserEmail,
      password: mockInputPassword,
    };

    await loginUseCase.execute(input);

    const validateCallOrder = mockLoginValidator.validate.mock.invocationCallOrder[0];
    const findByEmailCallOrder = mockUserRepository.findByEmail.mock.invocationCallOrder[0];

    expect(validateCallOrder).toBeLessThan(findByEmailCallOrder);
    expect(mockLoginValidator.validate).toHaveBeenCalledWith(input);
  });

  it('should handle errors from JWT generation', async () => {
    mockLoginValidator.validate.mockResolvedValueOnce();
    mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockHashProvider.compare.mockResolvedValueOnce(true);

    const jwtError = new Error('JWT generation failed');
    mockJwtProvider.generate.mockRejectedValueOnce(jwtError);

    const input = {
      email: mockUserEmail,
      password: mockInputPassword,
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(jwtError);

    expect(mockLoginValidator.validate).toHaveBeenCalledWith(input);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUserEmail.toLowerCase());
    expect(mockHashProvider.compare).toHaveBeenCalledWith(mockInputPassword, mockUserPassword);
    expect(mockJwtProvider.generate).toHaveBeenCalled();
  });
});
