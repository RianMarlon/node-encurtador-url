import { generateUUID } from '@/shared/utils/generate-uuid';
import { v7 as uuid } from 'uuid';

jest.mock('uuid', () => ({
  v7: jest.fn(),
}));

describe('generateUUID', () => {
  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
    (uuid as jest.Mock).mockReturnValue(mockUuid);
  });

  it('should generate a UUID v7', () => {
    const result = generateUUID();

    expect(uuid).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockUuid);
  });
});
