import { BaseEntity } from '@/shared/domain/base-entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import * as yup from 'yup';

interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  private _name: string;
  private _email: string;
  private _password: string;

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.validate(props);
    this._name = props.name;
    this._email = props.email.toLowerCase();
    this._password = props.password;
  }

  private validate(props: UserProps): void {
    const schema = yup.object().shape({
      name: yup
        .string()
        .required('Name is required')
        .max(100, 'Name must be at most 100 characters'),
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
      schema.validateSync(props, { abortEarly: false });
    } catch (err: any) {
      const notification = new NotificationError();

      err.inner.forEach((validationError: yup.ValidationError) => {
        notification.addError({
          message: validationError.message,
          code: 'BAD_REQUEST',
          context: 'User',
          field: validationError.path,
        });
      });

      throw notification;
    }
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }
}
