import { nanoid } from 'nanoid';

export function generateNanoId(size: number = 6): string {
  return nanoid(size);
}
