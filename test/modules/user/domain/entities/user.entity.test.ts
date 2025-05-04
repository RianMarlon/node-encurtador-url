import { User } from '@/modules/user/domain/entities/user.entity';
import { BaseEntity } from '@/shared/domain/base-entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock('@/shared/domain/base-entity');

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
      expect(user.email).toBe(userData.email);
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
      expect(user.email).toBe(email);
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

    it('should throw NotificationError when email is not valid', () => {
      expect(() => {
        new User({ name: 'John Doe', email: 'invalid-email', password: 'password123' });
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with correct error details when email is invalid', () => {
      try {
        new User({ name: 'John Doe', email: 'invalid-email', password: 'password123' });
        fail('Expected constructor to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Email must be a valid email');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].context).toBe('User');
        expect(errors[0].field).toBe('email');
      }
    });

    it('should throw NotificationError when name exceeds maximum length', () => {
      const longName = 'a'.repeat(101); // 101 characters
      expect(() => {
        new User({ name: longName, email: 'john@example.com', password: 'password123' });
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError when email exceeds maximum length', () => {
      const longEmail = `${'a'.repeat(247)}@example.com`;
      expect(() => {
        new User({ name: 'John Doe', email: longEmail, password: 'password123' });
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError when password exceeds maximum length', () => {
      const longPassword = 'a'.repeat(256);
      expect(() => {
        new User({ name: 'John Doe', email: 'john@example.com', password: longPassword });
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with multiple errors when there are multiple validation issues', () => {
      try {
        // @ts-expect-error - Intentionally passing invalid props for testing
        new User({ name: null, email: 'invalid-email', password: null });
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

    it('should accept valid email formats', () => {
      expect(() => {
        new User({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
      }).not.toThrow();

      expect(() => {
        new User({ name: 'John Doe', email: 'john.doe@example.co.uk', password: 'password123' });
      }).not.toThrow();

      expect(() => {
        new User({ name: 'John Doe', email: 'john+tag@example.com', password: 'password123' });
      }).not.toThrow();
    });
  });

  describe('getters', () => {
    it('should return the correct name value', () => {
      const name = 'John Doe';
      const user = new User({ name, email: 'john@example.com', password: 'password123' });
      expect(user.name).toBe(name);
    });

    it('should return the correct email value', () => {
      const email = 'john@example.com';
      const user = new User({ name: 'John Doe', email, password: 'password123' });
      expect(user.email).toBe(email);
    });

    it('should return the correct password value', () => {
      const password = 'password123';
      const user = new User({ name: 'John Doe', email: 'john@example.com', password });
      expect(user.password).toBe(password);
    });
  });
});
