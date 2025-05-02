import { generateEntityID } from '@/shared/utils/generate-entity-id';
import { v7 as uuid } from 'uuid';

jest.mock('uuid', () => ({
  v7: jest.fn(),
}));

describe('generateEntityID', () => {
  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
    (uuid as jest.Mock).mockReturnValue(mockUuid);
  });

  it('should generate a UUID v7', () => {
    const result = generateEntityID();

    expect(uuid).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockUuid);
  });
});
