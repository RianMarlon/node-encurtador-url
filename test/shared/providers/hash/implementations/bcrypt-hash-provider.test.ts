import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { BcryptHashProvider } from '@/shared/providers/hash/implementations/bcrypt-hash-provider';

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue(10),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('BcryptHashProvider', () => {
  let bcryptHashProvider: BcryptHashProvider;
  const mockPayload = 'password123';
  const mockHashedPayload = 'hashed_password123';

  beforeEach(() => {
    jest.clearAllMocks();
    bcryptHashProvider = new BcryptHashProvider();
  });

  describe('hash', () => {
    it('should call bcrypt.hash with correct parameters', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(mockHashedPayload);

      const result = await bcryptHashProvider.hash(mockPayload);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockPayload, 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockHashedPayload);
    });

    it('should return empty string when payload is null', async () => {
      const result = await bcryptHashProvider.hash(null as unknown as string);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toBe('');
    });

    it('should return empty string when payload is undefined', async () => {
      const result = await bcryptHashProvider.hash(undefined as unknown as string);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toBe('');
    });

    it('should return empty string when payload is an empty string', async () => {
      const result = await bcryptHashProvider.hash('');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toBe('');
    });

    it('should return empty string when payload contains only whitespace', async () => {
      const result = await bcryptHashProvider.hash('   ');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toBe('');
    });

    it('should throw an error if bcrypt.hash fails', async () => {
      const mockError = new Error('Hash error');
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(bcryptHashProvider.hash(mockPayload)).rejects.toThrow(mockError);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPayload, 10);
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
