import { User } from '@/modules/user/domain/entities/user.entity';
import { BaseEntity } from '@/shared/domain/entities/base-entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock('@/shared/domain/entities/base-entity');

describe('User', () => {
  const mockId = 'mock-entity-id-123';

  beforeEach(() => {
    jest.clearAllMocks();

    (BaseEntity as jest.Mock).mockImplementation(function (
      this: any,
      id?: string,
      createdAt?: Date,
      updatedAt?: Date,
    ) {
      this.id = id || mockId;
      this.createdAt = createdAt || new Date();
      this.updatedAt = updatedAt || new Date();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create entity with default values when only required fields are provided', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.password).toBe(userData.password);
    });

    it('should create entity with all provided parameters', () => {
      const id = 'custom-id';
      const name = 'John Doe';
      const email = 'john@example.com';
      const password = 'password123';
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const updatedAt = new Date('2025-02-01T00:00:00Z');

      const user = new User({
        id,
        name,
        email,
        password,
        createdAt,
        updatedAt,
      });

      expect(BaseEntity).toHaveBeenCalledWith(id, createdAt, updatedAt);
      expect(user.name).toBe(name);
      expect(user.email).toBe(email.toLowerCase());
      expect(user.password).toBe(password);
    });

    it('should throw NotificationError when name is missing', () => {
      expect(() => {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new User({ email: 'john@example.com', password: 'password123' });
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with correct error details when name is missing', () => {
      try {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new User({ email: 'john@example.com', password: 'password123' });
        fail('Expected constructor to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Name is required');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].context).toBe('User');
        expect(errors[0].field).toBe('name');
      }
    });

    it('should throw NotificationError when email is missing', () => {
      expect(() => {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new User({ name: 'John Doe', password: 'password123' });
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with correct error details when email is missing', () => {
      try {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new User({ name: 'John Doe', password: 'password123' });
        fail('Expected constructor to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Email is required');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].context).toBe('User');
        expect(errors[0].field).toBe('email');
      }
    });

    it('should throw NotificationError when password is missing', () => {
      expect(() => {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new User({ name: 'John Doe', email: 'john@example.com' });
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with correct error details when password is missing', () => {
      try {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new User({ name: 'John Doe', email: 'john@example.com' });
        fail('Expected constructor to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Password is required');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].context).toBe('User');
        expect(errors[0].field).toBe('password');
      }
    });

    it('should throw NotificationError with multiple errors when there are multiple validation issues', () => {
      try {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new User({ name: null, email: null, password: null });
        fail('Expected constructor to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBeGreaterThan(1);

        errors.forEach((err) => {
          expect(err.code).toBe('BAD_REQUEST');
          expect(err.context).toBe('User');
          expect(typeof err.message).toBe('string');
        });
      }
    });
  });

  describe('getters', () => {
    it('should return the correct name value', () => {
      const name = 'John Doe';
      const user = new User({ name, email: 'john@example.com', password: 'password123' });
      expect(user.name).toBe(name);
    });

    it('should return the correct email value (lowercase)', () => {
      const email = 'John@Example.com';
      const user = new User({ name: 'John Doe', email, password: 'password123' });
      expect(user.email).toBe(email.toLowerCase());
    });

    it('should return the correct password value', () => {
      const password = 'password123';
      const user = new User({ name: 'John Doe', email: 'john@example.com', password });
      expect(user.password).toBe(password);
    });
  });
});
