import { BaseEntity } from '@/shared/domain/entities/base-entity';
import { generateUUID } from '@/shared/utils/generate-uuid';

jest.mock('@/shared/utils/generate-uuid', () => ({
  generateUUID: jest.fn(),
}));

describe('BaseEntity', () => {
  const fixedDate = new Date('2025-05-01T00:00:00Z');
  const mockId = 'mock-entity-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as unknown as Date);
    (generateUUID as jest.Mock).mockReturnValue(mockId);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create entity with generated ID and current dates when no parameters are provided', () => {
      const entity = new BaseEntity();

      expect(generateUUID).toHaveBeenCalledTimes(1);
      expect(entity.id).toBe(mockId);
      expect(entity.createdAt).toEqual(fixedDate);
      expect(entity.updatedAt).toEqual(fixedDate);
    });

    it('should create entity with provided ID and current dates when only ID is provided', () => {
      const customId = 'custom-id-456';
      const entity = new BaseEntity(customId);

      expect(generateUUID).not.toHaveBeenCalled();
      expect(entity.id).toBe(customId);
      expect(entity.createdAt).toEqual(fixedDate);
      expect(entity.updatedAt).toEqual(fixedDate);
    });

    it('should create entity with provided ID and createdAt, and current date for updatedAt', () => {
      const customId = 'custom-id-456';
      const customCreatedAt = new Date('2025-05-01T00:00:00Z');

      const entity = new BaseEntity(customId, customCreatedAt);

      expect(entity.id).toBe(customId);
      expect(entity.createdAt).toEqual(customCreatedAt);
      expect(entity.updatedAt).toEqual(fixedDate);
    });

    it('should create entity with all provided parameters', () => {
      const customId = 'custom-id-456';
      const customCreatedAt = new Date('2025-05-01T00:00:00Z');
      const customUpdatedAt = new Date('2025-05-01T00:00:00Z');

      const entity = new BaseEntity(customId, customCreatedAt, customUpdatedAt);

      expect(entity.id).toBe(customId);
      expect(entity.createdAt).toEqual(customCreatedAt);
      expect(entity.updatedAt).toEqual(customUpdatedAt);
    });
  });

  describe('getters', () => {
    it('should return the correct id value', () => {
      const customId = 'custom-id-789';
      const entity = new BaseEntity(customId);

      expect(entity.id).toBe(customId);
    });

    it('should return the correct createdAt value', () => {
      const customCreatedAt = new Date('2021-05-10T15:30:00Z');
      const entity = new BaseEntity('any-id', customCreatedAt);

      expect(entity.createdAt).toBe(customCreatedAt);
    });

    it('should return the correct updatedAt value', () => {
      const customUpdatedAt = new Date('2021-06-15T10:45:00Z');
      const entity = new BaseEntity('any-id', undefined, customUpdatedAt);

      expect(entity.updatedAt).toBe(customUpdatedAt);
    });
  });

  describe('setters', () => {
    it('should update the updatedAt value when using the setter', () => {
      const entity = new BaseEntity();
      const newUpdatedAt = new Date('2025-06-15T10:45:00Z');

      entity.updatedAt = newUpdatedAt;

      expect(entity.updatedAt).toBe(newUpdatedAt);
    });
  });
});
