import {
  NotificationError,
  NotificationErrorItem,
} from '@/shared/domain/errors/notification-error';

describe('NotificationError', () => {
  describe('constructor', () => {
    it('should create an instance with no errors', () => {
      const notificationError = new NotificationError();

      expect(notificationError).toBeInstanceOf(Error);
      expect(notificationError.message).toBe('Validation failed');
      expect(notificationError.hasErrors()).toBe(false);
      expect(notificationError.getErrors()).toEqual([]);
    });

    it('should create an instance with initial errors', () => {
      const initialErrors: NotificationErrorItem[] = [
        { message: 'Field is required', code: 'BAD_REQUEST', field: 'name' },
        { message: 'Invalid email format', code: 'BAD_REQUEST', field: 'email' },
      ];

      const notificationError = new NotificationError(initialErrors);

      expect(notificationError).toBeInstanceOf(Error);
      expect(notificationError.message).toBe('Validation failed');
      expect(notificationError.hasErrors()).toBe(true);
      expect(notificationError.getErrors()).toEqual(initialErrors);
    });
  });

  describe('addError', () => {
    it('should add a new error to the errors list', () => {
      const notificationError = new NotificationError();
      const error: NotificationErrorItem = {
        message: 'Field is required',
        code: 'BAD_REQUEST',
        field: 'name',
      };

      notificationError.addError(error);

      expect(notificationError.hasErrors()).toBe(true);
      expect(notificationError.getErrors()).toEqual([error]);
    });

    it('should add multiple errors to the errors list', () => {
      const notificationError = new NotificationError();
      const error1: NotificationErrorItem = {
        message: 'Field is required',
        code: 'BAD_REQUEST',
        field: 'name',
      };
      const error2: NotificationErrorItem = {
        message: 'Invalid email format',
        code: 'BAD_REQUEST',
        field: 'email',
      };

      notificationError.addError(error1);
      notificationError.addError(error2);

      expect(notificationError.hasErrors()).toBe(true);
      expect(notificationError.getErrors()).toEqual([error1, error2]);
    });
  });

  describe('hasErrors', () => {
    it('should return false when there are no errors', () => {
      const notificationError = new NotificationError();

      expect(notificationError.hasErrors()).toBe(false);
    });

    it('should return true when there are errors', () => {
      const notificationError = new NotificationError([
        { message: 'Field is required', code: 'BAD_REQUEST', field: 'name' },
      ]);

      expect(notificationError.hasErrors()).toBe(true);
    });
  });

  describe('getErrors', () => {
    it('should return an empty array when there are no errors', () => {
      const notificationError = new NotificationError();

      expect(notificationError.getErrors()).toEqual([]);
    });

    it('should return all errors', () => {
      const errors: NotificationErrorItem[] = [
        { message: 'Field is required', code: 'BAD_REQUEST', field: 'name' },
        { message: 'Invalid email format', code: 'BAD_REQUEST', field: 'email' },
      ];

      const notificationError = new NotificationError(errors);

      expect(notificationError.getErrors()).toEqual(errors);
    });
  });

  describe('getErrorsByContext', () => {
    it('should return an empty object when there are no errors', () => {
      const notificationError = new NotificationError();

      expect(notificationError.getErrorsByContext()).toEqual({});
    });

    it('should group errors by context', () => {
      const errors: NotificationErrorItem[] = [
        { message: 'Field is required', code: 'BAD_REQUEST', field: 'name', context: 'user' },
        {
          message: 'Invalid email format',
          code: 'BAD_REQUEST',
          field: 'email',
          context: 'user',
        },
        { message: 'Invalid date', code: 'BAD_REQUEST', field: 'birthDate', context: 'profile' },
        { message: 'Field is too short', code: 'BAD_REQUEST', field: 'bio', context: 'profile' },
      ];

      const notificationError = new NotificationError(errors);
      const errorsByContext = notificationError.getErrorsByContext();

      expect(Object.keys(errorsByContext)).toEqual(['user', 'profile']);
      expect(errorsByContext.user).toEqual([
        { message: 'Field is required', code: 'BAD_REQUEST', field: 'name', context: 'user' },
        {
          message: 'Invalid email format',
          code: 'BAD_REQUEST',
          field: 'email',
          context: 'user',
        },
      ]);
      expect(errorsByContext.profile).toEqual([
        { message: 'Invalid date', code: 'BAD_REQUEST', field: 'birthDate', context: 'profile' },
        { message: 'Field is too short', code: 'BAD_REQUEST', field: 'bio', context: 'profile' },
      ]);
    });

    it('should use "default" as context when not specified', () => {
      const errors: NotificationErrorItem[] = [
        { message: 'Field is required', code: 'BAD_REQUEST', field: 'name' },
        { message: 'Invalid email format', code: 'BAD_REQUEST', field: 'email' },
        { message: 'Invalid date', code: 'BAD_REQUEST', field: 'birthDate', context: 'profile' },
      ];

      const notificationError = new NotificationError(errors);
      const errorsByContext = notificationError.getErrorsByContext();

      expect(Object.keys(errorsByContext)).toEqual(['default', 'profile']);
      expect(errorsByContext.default).toEqual([
        { message: 'Field is required', code: 'BAD_REQUEST', field: 'name' },
        { message: 'Invalid email format', code: 'BAD_REQUEST', field: 'email' },
      ]);
      expect(errorsByContext.profile).toEqual([
        { message: 'Invalid date', code: 'BAD_REQUEST', field: 'birthDate', context: 'profile' },
      ]);
    });
  });

  describe('toJSON', () => {
    it('should return an object with errors property containing an empty array when there are no errors', () => {
      const notificationError = new NotificationError();

      expect(notificationError.toJSON()).toEqual({ errors: [] });
    });

    it('should return an object with errors property containing all errors', () => {
      const errors: NotificationErrorItem[] = [
        { message: 'Field is required', code: 'BAD_REQUEST', field: 'name' },
        { message: 'Invalid email format', code: 'BAD_REQUEST', field: 'email' },
      ];

      const notificationError = new NotificationError(errors);

      expect(notificationError.toJSON()).toEqual({ errors });
    });
  });
});
