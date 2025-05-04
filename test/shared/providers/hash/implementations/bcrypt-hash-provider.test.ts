import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { BcryptHashProvider } from '@/shared/providers/hash/implementations/bcrypt-hash-provider';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('BcryptHashProvider', () => {
  let bcryptHashProvider: BcryptHashProvider;
  const mockPayload = 'password123';
  const mockHashedPayload = 'hashed_password123';
  const mockSalt = 10;

  beforeEach(() => {
    jest.clearAllMocks();
    bcryptHashProvider = new BcryptHashProvider();
  });

  describe('hash', () => {
    it('should call bcrypt.hash with correct parameters', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(mockHashedPayload);

      const result = await bcryptHashProvider.hash(mockPayload);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockPayload, mockSalt);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockHashedPayload);
    });

    it('should throw an error if bcrypt.hash fails', async () => {
      const mockError = new Error('Hash error');
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(bcryptHashProvider.hash(mockPayload)).rejects.toThrow(mockError);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPayload, mockSalt);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });
  });

  describe('compare', () => {
    it('should call bcrypt.compare with correct parameters and return true for matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await bcryptHashProvider.compare(mockPayload, mockHashedPayload);

      expect(bcrypt.compare).toHaveBeenCalledWith(mockPayload, mockHashedPayload);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should call bcrypt.compare with correct parameters and return false for non-matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await bcryptHashProvider.compare(mockPayload, mockHashedPayload);

      expect(bcrypt.compare).toHaveBeenCalledWith(mockPayload, mockHashedPayload);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it('should throw an error if bcrypt.compare fails', async () => {
      const mockError = new Error('Compare error');
      (bcrypt.compare as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(bcryptHashProvider.compare(mockPayload, mockHashedPayload)).rejects.toThrow(
        mockError,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPayload, mockHashedPayload);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });
});
