/**
 * Structured logging utility for backend APIs
 * Provides consistent logging format and levels
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  requestId?: string;
}

class Logger {
  private serviceName: string;
  private logLevel: LogLevel;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    switch (envLevel) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const logData = {
      ...entry,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
    };

    // In production, you might send this to a logging service
    console.log(JSON.stringify(logData, null, process.env.NODE_ENV === 'development' ? 2 : 0));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>, requestId?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      service: this.serviceName,
      message,
      context,
      error,
      requestId
    });
  }

  warn(message: string, context?: Record<string, unknown>, requestId?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      service: this.serviceName,
      message,
      context,
      requestId
    });
  }

  info(message: string, context?: Record<string, unknown>, requestId?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      service: this.serviceName,
      message,
      context,
      requestId
    });
  }

  debug(message: string, context?: Record<string, unknown>, requestId?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      service: this.serviceName,
      message,
      context,
      requestId
    });
  }
}

export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName);
}

// Default logger instance
export const logger = createLogger('api');

// Default export for backend integrity check
export default {
  LogLevel,
  Logger,
  createLogger,
  logger
};