import pino from 'pino';
import { getCurrentTraceId } from './trace-context';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';
import { injectable } from 'tsyringe';

@injectable()
export class PinoLoggerProvider implements LoggerProvider {
  private logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    mixin() {
      const traceId = getCurrentTraceId();
      return traceId ? { traceId } : {};
    },
  });

  info(message: string): void {
    this.logger.info(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }
}
