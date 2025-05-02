import { v7 as uuid } from 'uuid';

export function generateEntityID(): string {
  return uuid();
}
