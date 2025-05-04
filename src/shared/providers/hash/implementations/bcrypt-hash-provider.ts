import * as bcrypt from 'bcrypt';
import { injectable } from 'tsyringe';

import { HashProvider } from '../interfaces/hash-provider.interface';

@injectable()
export class BcryptHashProvider implements HashProvider {
  private readonly salt: number = 10;

  public async hash(payload: string): Promise<string> {
    if (!payload || payload.trim() === '') {
      return '';
    }
    return bcrypt.hash(payload, this.salt);
  }

  public async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
