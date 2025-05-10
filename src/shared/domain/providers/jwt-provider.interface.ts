export interface JwtPayload {
  [key: string]: unknown;
}

export interface JwtProvider {
  generate(payload: JwtPayload): Promise<string>;
  verify<T extends JwtPayload>(token: string): Promise<T>;
  decode<T extends JwtPayload>(token: string): Promise<T | null>;
}
