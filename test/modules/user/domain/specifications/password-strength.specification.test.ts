import { PasswordStrengthSpecification } from '@/modules/user/domain/specifications/password-strength.specification';
import { NotificationError } from '@/shared/domain/errors/notification-error';

describe('PasswordStrengthSpecification', () => {
  let passwordStrengthSpecification: PasswordStrengthSpecification;

  beforeEach(() => {
    passwordStrengthSpecification = new PasswordStrengthSpecification();
  });

  describe('constructor', () => {
    it('should create with default values when no parameters are provided', () => {
      const specification = new PasswordStrengthSpecification();

      expect(specification.isSatisfiedBy('Abc12345!')).toBe(true);
      expect(specification.isSatisfiedBy('Abc1!')).toBe(false);
    });

    it('should create with custom minLength and maxLength', () => {
      const minLength = 6;
      const maxLength = 12;
      const specification = new PasswordStrengthSpecification(minLength, maxLength);

      expect(specification.isSatisfiedBy('Abc12!')).toBe(true);
      expect(specification.isSatisfiedBy('Abc1!')).toBe(false);
      expect(specification.isSatisfiedBy('Abc123456789!')).toBe(false);
    });
  });

  describe('isSatisfiedBy', () => {
    it('should return true for valid passwords', () => {
      const validPasswords = [
        'Password123!',
        'Abcdef12#',
        'Test@1234',
        'Complex_Password123',
        'P@ssw0rd',
        '1Password!',
      ];

      validPasswords.forEach((password) => {
        expect(passwordStrengthSpecification.isSatisfiedBy(password)).toBe(true);
      });
    });

    it('should return false for passwords that are too short', () => {
      const tooShortPassword = 'Abc1!';
      expect(passwordStrengthSpecification.isSatisfiedBy(tooShortPassword)).toBe(false);
    });

    it('should return false for passwords that are too long', () => {
      const tooLongPassword = 'A'.repeat(25) + 'b1!'.repeat(2);
      expect(passwordStrengthSpecification.isSatisfiedBy(tooLongPassword)).toBe(false);
    });

    it('should return false for passwords without uppercase letters', () => {
      const noUppercasePassword = 'password123!';
      expect(passwordStrengthSpecification.isSatisfiedBy(noUppercasePassword)).toBe(false);
    });

    it('should return false for passwords without lowercase letters', () => {
      const noLowercasePassword = 'PASSWORD123!';
      expect(passwordStrengthSpecification.isSatisfiedBy(noLowercasePassword)).toBe(false);
    });

    it('should return false for passwords without digits', () => {
      const noDigitsPassword = 'Password!';
      expect(passwordStrengthSpecification.isSatisfiedBy(noDigitsPassword)).toBe(false);
    });

    it('should return false for passwords without symbols', () => {
      const noSymbolsPassword = 'Password123';
      expect(passwordStrengthSpecification.isSatisfiedBy(noSymbolsPassword)).toBe(false);
    });

    it('should return false for passwords that fail multiple criteria', () => {
      const multipleFailuresPassword = 'password';
      expect(passwordStrengthSpecification.isSatisfiedBy(multipleFailuresPassword)).toBe(false);
    });

    it('should consider underscore as a valid symbol', () => {
      const passwordWithUnderscore = 'Password123_';
      expect(passwordStrengthSpecification.isSatisfiedBy(passwordWithUnderscore)).toBe(true);
    });
  });

  describe('validate', () => {
    it('should not throw for valid passwords', () => {
      const validPassword = 'Password123!';
      expect(() => {
        passwordStrengthSpecification.validate(validPassword);
      }).not.toThrow();
    });

    it('should throw NotificationError for invalid passwords', () => {
      const invalidPassword = 'password';

      expect(() => {
        passwordStrengthSpecification.validate(invalidPassword);
      }).toThrow(NotificationError);
    });

    it('should throw NotificationError with correct error details', () => {
      const invalidPassword = 'password';

      try {
        passwordStrengthSpecification.validate(invalidPassword);
        fail('Expected validate to throw NotificationError');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        expect(notificationError.hasErrors()).toBe(true);

        const errors = notificationError.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe(
          'Password must be between 8 and 30 chars, contain uppercase, lowercase, digits and symbols',
        );
        expect(errors[0].code).toBe('BAD_REQUEST');
        expect(errors[0].context).toBe('User');
        expect(errors[0].field).toBe('password');
      }
    });

    it('should include custom length requirements in error message when using custom constructor values', () => {
      const minLength = 10;
      const maxLength = 20;
      const specification = new PasswordStrengthSpecification(minLength, maxLength);
      const invalidPassword = 'Pass1!';

      try {
        specification.validate(invalidPassword);
        fail('Expected validate to throw NotificationError');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationError);
        const notificationError = error as NotificationError;

        const errors = notificationError.getErrors();
        expect(errors[0].message).toBe(
          `Password must be between ${minLength} and ${maxLength} chars, contain uppercase, lowercase, digits and symbols`,
        );
      }
    });
  });
});
