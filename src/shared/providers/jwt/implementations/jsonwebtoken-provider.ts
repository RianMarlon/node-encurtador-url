import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import { JwtPayload, JwtProvider } from '../interfaces/jwt-provider.interface';

@injectable()
export class JsonWebTokenProvider implements JwtProvider {
  private readonly secret: string = process.env.JWT_SECRET as string;
  private readonly expiresIn: number = parseInt(process.env.JWT_EXPIRES_IN as string) || 43200;

  public async generate(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  public async verify<T extends JwtPayload>(token: string): Promise<T> {
    try {
      const decoded = jwt.verify(token, this.secret) as T;
      return decoded;
    } catch {
      throw new Error('Invalid token');
    }
  }

  public async decode<T extends JwtPayload>(token: string): Promise<T | null> {
    try {
      return jwt.decode(token) as T;
    } catch {
      return null;
    }
  }
}
