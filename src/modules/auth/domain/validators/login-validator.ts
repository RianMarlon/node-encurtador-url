export interface LoginValidator {
  validate(data: { email: string; password: string }): Promise<void>;
}
