import 'reflect-metadata';
import * as yup from 'yup';
import { LoginYupValidator } from '@/modules/auth/infra/validators/yup/login-yup.validator';
import { NotificationError } from '@/shared/domain/errors/notification-error';

describe('LoginYupValidator', () => {
  let loginYupValidator: LoginYupValidator;

  beforeEach(() => {
    loginYupValidator = new LoginYupValidator();
  });

  describe('validate', () => {
    it('should not throw error when data is valid', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(loginYupValidator.validate(validData)).resolves.not.toThrow();
    });

    it('should throw NotificationError when email is missing', async () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };

      await expect(loginYupValidator.validate(invalidData)).rejects.toThrow(NotificationError);

      try {
        await loginYupValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Email is required');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].field).toBe('email');
      }
    });

    it('should throw NotificationError when password is missing', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      await expect(loginYupValidator.validate(invalidData)).rejects.toThrow(NotificationError);

      try {
        await loginYupValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Password is required');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].field).toBe('password');
      }
    });

    it('should throw NotificationError when email is invalid', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(loginYupValidator.validate(invalidData)).rejects.toThrow(NotificationError);

      try {
        await loginYupValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Email must be a valid email');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].field).toBe('email');
      }
    });

    it('should throw NotificationError when email exceeds maximum length', async () => {
      const longEmail = `${'a'.repeat(247)}@example.com`;
      const invalidData = {
        email: longEmail,
        password: 'password123',
      };

      await expect(loginYupValidator.validate(invalidData)).rejects.toThrow(NotificationError);

      try {
        await loginYupValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Email must be at most 255 characters');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].field).toBe('email');
      }
    });

    it('should throw NotificationError when password exceeds maximum length', async () => {
      const longPassword = 'a'.repeat(256);
      const invalidData = {
        email: 'test@example.com',
        password: longPassword,
      };

      await expect(loginYupValidator.validate(invalidData)).rejects.toThrow(NotificationError);

      try {
        await loginYupValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Password must be at most 255 characters');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].field).toBe('password');
      }
    });

    it('should throw NotificationError with multiple errors when multiple fields are invalid', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      await expect(loginYupValidator.validate(invalidData)).rejects.toThrow(NotificationError);

      try {
        await loginYupValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(2);

        const errorMessages = errors.map((e) => e.message);
        expect(errorMessages).toContain('Email must be a valid email');
        expect(errorMessages).toContain('Password is required');

        errors.forEach((err) => {
          expect(err.code).toBe('BAD_REQUEST');
        });

        const emailError = errors.find((e) => e.field === 'email');
        const passwordError = errors.find((e) => e.field === 'password');
        expect(emailError).toBeDefined();
        expect(passwordError).toBeDefined();
      }
    });

    it('should handle null values gracefully', async () => {
      const invalidData = {
        email: null as unknown as string,
        password: null as unknown as string,
      };

      await expect(loginYupValidator.validate(invalidData)).rejects.toThrow(NotificationError);

      try {
        await loginYupValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(2);
      }
    });

    it('should handle undefined values gracefully', async () => {
      const invalidData = {
        email: undefined as unknown as string,
        password: undefined as unknown as string,
      };

      await expect(loginYupValidator.validate(invalidData)).rejects.toThrow(NotificationError);

      try {
        await loginYupValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(2);
      }
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'simple@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
        'other.email-with-hyphen@example.com',
        'fully-qualified-domain@example.com',
        'user.name+tag+sorting@example.com',
        'x@example.com',
        'example-indeed@strange-example.com',
        'example@s.example',
      ];

      for (const email of validEmails) {
        const validData = {
          email,
          password: 'password123',
        };

        await expect(loginYupValidator.validate(validData)).resolves.not.toThrow();
      }
    });

    it('should mock yup.validate to test error handling', async () => {
      interface YupValidationError extends Error {
        inner: yup.ValidationError[];
      }

      const mockError = new Error('Validation failed') as YupValidationError;
      mockError.inner = [{ message: 'Custom error', path: 'customField' } as yup.ValidationError];

      const mockValidate = jest.fn().mockRejectedValueOnce(mockError);
      const mockSchema = { validate: mockValidate };

      jest.spyOn(yup, 'object').mockImplementationOnce(
        () =>
          ({
            shape: jest.fn().mockReturnValue(mockSchema),
          }) as any,
      );

      const data = {
        email: 'test@example.com',
        password: 'password123',
      };

      try {
        await loginYupValidator.validate(data);
        fail('Expected validate to throw NotificationError');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Custom error');
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].field).toBe('customField');
      }

      expect(mockValidate).toHaveBeenCalledWith(data, { abortEarly: false });
    });
  });
});
