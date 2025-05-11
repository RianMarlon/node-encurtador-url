import { AsyncLocalStorage } from 'async_hooks';

type TraceContextType = { traceId: string };

const traceStorage = new AsyncLocalStorage<TraceContextType>();

export function runWithTrace<T>(traceId: string, fn: () => T): T {
  return traceStorage.run({ traceId }, fn);
}

export function getCurrentTraceId(): string | undefined {
  return traceStorage.getStore()?.traceId;
}
