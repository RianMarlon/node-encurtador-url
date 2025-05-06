import { NotificationError } from '@/shared/domain/errors/notification-error';

export class PasswordStrengthSpecification {
  constructor(
    private readonly minLength = 8,
    private readonly maxLength = 30,
  ) {}

  isSatisfiedBy(candidate: string): boolean {
    return (
      candidate.length >= this.minLength &&
      candidate.length <= this.maxLength &&
      /[A-Z]/.test(candidate) &&
      /[a-z]/.test(candidate) &&
      /[0-9]/.test(candidate) &&
      /[\W_]/.test(candidate)
    );
  }

  validate(candidate: string): void {
    if (!this.isSatisfiedBy(candidate)) {
      const notification = new NotificationError();
      notification.addError({
        message: `Password must be between ${this.minLength} and ${this.maxLength} chars, contain uppercase, lowercase, digits and symbols`,
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
      throw notification;
    }
  }
}
