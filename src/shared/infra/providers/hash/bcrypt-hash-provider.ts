import bcrypt from 'bcryptjs';
import { injectable } from 'tsyringe';

import { HashProvider } from '../../../domain/providers/hash-provider.interface';

@injectable()
export class BcryptHashProvider implements HashProvider {
  public async hash(payload: string): Promise<string> {
    if (!payload || payload.trim() === '') {
      return '';
    }

    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(payload, salt);
  }

  public async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
