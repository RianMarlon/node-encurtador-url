import { v7 as uuid } from 'uuid';

export function generateUUID(): string {
  return uuid();
}
