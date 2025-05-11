import 'reflect-metadata';
import { PinoLoggerProvider } from '@/shared/infra/providers/logger/pino-logger-provider';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';
import { getCurrentTraceId } from '@/shared/infra/providers/logger/trace-context';

jest.mock('@/shared/infra/providers/logger/trace-context', () => ({
  getCurrentTraceId: jest.fn(),
}));

const pinoLoggerMock = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

let pinoConfig: any;

jest.mock('pino', () => {
  return jest.fn().mockImplementation((config) => {
    pinoConfig = config;

    const createLogMethod = (method: keyof typeof pinoLoggerMock) => {
      return (message: string) => {
        const mixinResult = config.mixin ? config.mixin() : {};
        pinoLoggerMock[method](mixinResult, message);
      };
    };

    return {
      info: createLogMethod('info'),
      error: createLogMethod('error'),
      warn: createLogMethod('warn'),
      debug: createLogMethod('debug'),
    };
  });
});

describe('PinoLoggerProvider', () => {
  let logger: LoggerProvider;
  const traceId = '1234-5678';
  const message = 'Test log message';

  beforeEach(() => {
    jest.clearAllMocks();
    logger = new PinoLoggerProvider();
  });

  describe('Configuration', () => {
    it('should configure pino with the correct level', () => {
      expect(pinoConfig.level).toBe(process.env.LOG_LEVEL || 'info');
    });

    describe('formatters.level', () => {
      it('should format the level as { level: label }', () => {
        const formatter = pinoConfig.formatters.level;
        expect(formatter('info')).toEqual({ level: 'info' });
        expect(formatter('error')).toEqual({ level: 'error' });
      });
    });

    describe('mixin', () => {
      it('should call getCurrentTraceId and return { traceId } when present', () => {
        (getCurrentTraceId as jest.Mock).mockReturnValueOnce(traceId);
        const result = pinoConfig.mixin();
        expect(getCurrentTraceId).toHaveBeenCalled();
        expect(result).toEqual({ traceId });
      });

      it('should return empty object when traceId is not present', () => {
        (getCurrentTraceId as jest.Mock).mockReturnValueOnce(undefined);
        const result = pinoConfig.mixin();
        expect(getCurrentTraceId).toHaveBeenCalled();
        expect(result).toEqual({});
      });
    });
  });

  describe('info', () => {
    it('should log with traceId when available', () => {
      (getCurrentTraceId as jest.Mock).mockReturnValueOnce(traceId);
      logger.info(message);
      expect(pinoLoggerMock.info).toHaveBeenCalledWith({ traceId }, message);
    });

    it('should log without traceId when not available', () => {
      (getCurrentTraceId as jest.Mock).mockReturnValueOnce(undefined);
      logger.info(message);
      expect(pinoLoggerMock.info).toHaveBeenCalledWith({}, message);
    });
  });

  describe('error', () => {
    it('should log with traceId when available', () => {
      (getCurrentTraceId as jest.Mock).mockReturnValueOnce(traceId);
      logger.error(message);
      expect(pinoLoggerMock.error).toHaveBeenCalledWith({ traceId }, message);
    });

    it('should log without traceId when not available', () => {
      (getCurrentTraceId as jest.Mock).mockReturnValueOnce(undefined);
      logger.error(message);
      expect(pinoLoggerMock.error).toHaveBeenCalledWith({}, message);
    });
  });

  describe('warn', () => {
    it('should log with traceId when available', () => {
      (getCurrentTraceId as jest.Mock).mockReturnValueOnce(traceId);
      logger.warn(message);
      expect(pinoLoggerMock.warn).toHaveBeenCalledWith({ traceId }, message);
    });

    it('should log without traceId when not available', () => {
      (getCurrentTraceId as jest.Mock).mockReturnValueOnce(undefined);
      logger.warn(message);
      expect(pinoLoggerMock.warn).toHaveBeenCalledWith({}, message);
    });
  });

  describe('debug', () => {
    it('should log with traceId when available', () => {
      (getCurrentTraceId as jest.Mock).mockReturnValueOnce(traceId);
      logger.debug(message);
      expect(pinoLoggerMock.debug).toHaveBeenCalledWith({ traceId }, message);
    });

    it('should log without traceId when not available', () => {
      (getCurrentTraceId as jest.Mock).mockReturnValueOnce(undefined);
      logger.debug(message);
      expect(pinoLoggerMock.debug).toHaveBeenCalledWith({}, message);
    });
  });
});
