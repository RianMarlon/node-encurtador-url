export interface JwtPayload {
  [key: string]: any;
}

export interface JwtProvider {
  generate(payload: JwtPayload): Promise<string>;
  verify(token: string): Promise<boolean>;
  decode<T extends JwtPayload>(token: string): Promise<T | null>;
}
