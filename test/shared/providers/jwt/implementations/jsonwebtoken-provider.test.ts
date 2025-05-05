import 'reflect-metadata';
import jwt from 'jsonwebtoken';
import { JsonWebTokenProvider } from '@/shared/providers/jwt/implementations/jsonwebtoken-provider';
import { JwtPayload } from '@/shared/providers/jwt/interfaces/jwt-provider.interface';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
}));

describe('JsonWebTokenProvider', () => {
  let jsonWebTokenProvider: JsonWebTokenProvider;
  const mockSecret = 'test_secret';
  const mockExpiresIn = 3600;
  const mockPayload: JwtPayload = { userId: '123', email: 'test@example.com' };
  const mockToken = 'mock.jwt.token';
  const mockDecodedToken = { sub: 'user-123', name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = mockSecret;
    process.env.JWT_EXPIRES_IN = String(mockExpiresIn);

    jsonWebTokenProvider = new JsonWebTokenProvider();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  describe('generate', () => {
    it('should call jwt.sign with correct parameters', async () => {
      (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      const result = await jsonWebTokenProvider.generate(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, mockSecret, { expiresIn: mockExpiresIn });
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockToken);
    });

    it('should use default expiresIn value when environment variable is not set', async () => {
      delete process.env.JWT_EXPIRES_IN;
      const defaultExpiresIn = 43200;
      jsonWebTokenProvider = new JsonWebTokenProvider();

      (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      await jsonWebTokenProvider.generate(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, mockSecret, {
        expiresIn: defaultExpiresIn,
      });
    });

    it('should throw an error if jwt.sign fails', async () => {
      const mockError = new Error('Sign error');
      (jwt.sign as jest.Mock).mockImplementationOnce(() => {
        throw mockError;
      });

      await expect(jsonWebTokenProvider.generate(mockPayload)).rejects.toThrow(mockError);
      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, mockSecret, { expiresIn: mockExpiresIn });
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });
  });

  describe('verify', () => {
    it('should return decoded token when token is valid', async () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockDecodedToken);

      const result = await jsonWebTokenProvider.verify(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockSecret);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDecodedToken);
    });

    it('should throw error when token verification fails', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Some JWT error');
      });

      await expect(jsonWebTokenProvider.verify(mockToken)).rejects.toThrow('Invalid token');
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockSecret);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
    });
  });

  describe('decode', () => {
    it('should return decoded payload when token is valid', async () => {
      (jwt.decode as jest.Mock).mockReturnValueOnce(mockPayload);

      const result = await jsonWebTokenProvider.decode<typeof mockPayload>(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(jwt.decode).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPayload);
    });

    it('should return null when token decoding fails', async () => {
      (jwt.decode as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Decode error');
      });

      const result = await jsonWebTokenProvider.decode(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(jwt.decode).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('should return null when decoded token is null', async () => {
      (jwt.decode as jest.Mock).mockReturnValueOnce(null);

      const result = await jsonWebTokenProvider.decode(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBeNull();
    });
  });
});
