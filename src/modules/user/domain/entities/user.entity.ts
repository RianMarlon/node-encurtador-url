import { BaseEntity } from '@/shared/domain/base-entity';
import { NotificationError } from '@/shared/domain/errors/notification-error';

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
    const notification = new NotificationError();

    if (!props.name) {
      notification.addError({
        message: 'Name is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'name',
      });
    }

    if (!props.email) {
      notification.addError({
        message: 'Email is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'email',
      });
    }

    if (!props.password) {
      notification.addError({
        message: 'Password is required',
        code: 'BAD_REQUEST',
        context: 'User',
        field: 'password',
      });
    }

    if (notification.hasErrors()) {
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
