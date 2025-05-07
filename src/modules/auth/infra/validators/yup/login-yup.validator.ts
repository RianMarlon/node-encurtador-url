import * as yup from 'yup';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { LoginValidator } from '@/modules/auth/domain/validators/login-validator';

export class LoginYupValidator implements LoginValidator {
  async validate(data: { email: string; password: string }): Promise<void> {
    const schema = yup.object().shape({
      email: yup
        .string()
        .email('Email must be a valid email')
        .required('Email is required')
        .max(255, 'Email must be at most 255 characters'),
      password: yup
        .string()
        .required('Password is required')
        .max(255, 'Password must be at most 255 characters'),
    });

    try {
      await schema.validate(data, { abortEarly: false });
    } catch (err: any) {
      const notification = new NotificationError();

      err.inner.forEach((validationError: yup.ValidationError) => {
        notification.addError({
          message: validationError.message,
          code: 'BAD_REQUEST',
          field: validationError.path,
        });
      });

      throw notification;
    }
  }
}
