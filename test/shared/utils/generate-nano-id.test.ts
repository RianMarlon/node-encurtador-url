import { generateNanoId } from '@/shared/utils/generate-nano-id';
import { nanoid } from 'nanoid';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

describe('generateNanoId', () => {
  const mockNanoId = 'abc123';

  beforeEach(() => {
    jest.clearAllMocks();
    (nanoid as jest.Mock).mockReturnValue(mockNanoId);
  });

  it('should generate a nano id with default size of 6', () => {
    const result = generateNanoId();

    expect(nanoid).toHaveBeenCalledTimes(1);
    expect(nanoid).toHaveBeenCalledWith(6);
    expect(result).toBe(mockNanoId);
  });

  it('should generate a nano id with custom size', () => {
    const customSize = 10;
    const result = generateNanoId(customSize);

    expect(nanoid).toHaveBeenCalledTimes(1);
    expect(nanoid).toHaveBeenCalledWith(customSize);
    expect(result).toBe(mockNanoId);
  });
});
