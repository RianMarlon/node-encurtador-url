export type NotificationErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'TOO_MANY_REQUESTS';

export interface NotificationErrorItem {
  message: string;
  code: NotificationErrorCode;
  context?: string;
  field?: string;
}

export class NotificationError extends Error {
  private readonly errors: NotificationErrorItem[] = [];

  constructor(initialErrors?: NotificationErrorItem[]) {
    super('Validation failed');
    if (initialErrors) {
      this.errors.push(...initialErrors);
    }
  }

  public addError(error: NotificationErrorItem): void {
    this.errors.push(error);
  }

  public hasErrors(): boolean {
    return this.errors.length > 0;
  }

  public getErrors(): NotificationErrorItem[] {
    return this.errors;
  }

  public getErrorsByContext(): Record<string, NotificationErrorItem[]> {
    return this.errors.reduce(
      (acc, err) => {
        const ctx = err.context || 'default';
        if (!acc[ctx]) {
          acc[ctx] = [];
        }
        acc[ctx].push(err);
        return acc;
      },
      {} as Record<string, NotificationErrorItem[]>,
    );
  }

  public toJSON(): { errors: NotificationErrorItem[] } {
    return { errors: this.errors };
  }
}
