/**
 * Spectra Logging Utility
 * Provides consistent logging across the application with debug modes
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

type LogMethod = 'log' | 'warn' | 'error';

interface SpectraLoggerOptions {
  /**
   * Override the initial debug mode detection. Primarily used in tests to ensure deterministic state.
   */
  debug?: boolean;
  /**
   * Explicitly set the minimum log level. When omitted it is inferred from the debug flag.
   */
  logLevel?: LogLevel;
}

/**
 * Spectra logging facade that keeps console output consistent across environments.
 * The implementation intentionally avoids `any` so that linting remains strict.
 */
export class SpectraLogger {
  private debugMode: boolean;
  private logLevel: LogLevel;

  constructor(options: SpectraLoggerOptions = {}) {
    const inferredDebug =
      import.meta.env.VITE_DEBUG === 'true' ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('spectra-debug') === 'true') ||
      import.meta.env.DEV;

    this.debugMode = typeof options.debug === 'boolean' ? options.debug : inferredDebug;
    this.logLevel = options.logLevel ?? (this.debugMode ? LogLevel.DEBUG : LogLevel.INFO);
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, component: string, message: string): string {
    const timestamp = new Date().toISOString().slice(11, 23);
    return `[${timestamp}] ${level} [${component}] ${message}`;
  }

  private emit(method: LogMethod, label: string, level: LogLevel, component: string, message: string, args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const consoleMethod = console[method] ?? console.log;
    consoleMethod.call(console, this.formatMessage(label, component, message), ...args);
  }

  debug(component: string, message: string, ...args: unknown[]): void {
    this.emit('log', 'DEBUG', LogLevel.DEBUG, component, message, args);
  }

  info(component: string, message: string, ...args: unknown[]): void {
    this.emit('log', 'INFO', LogLevel.INFO, component, message, args);
  }

  warn(component: string, message: string, ...args: unknown[]): void {
    this.emit('warn', 'WARN', LogLevel.WARN, component, message, args);
  }

  error(component: string, message: string, ...args: unknown[]): void {
    this.emit('error', 'ERROR', LogLevel.ERROR, component, message, args);
  }

  // Voice-specific logging helpers
  voice(message: string, ...args: unknown[]): void {
    this.info('Voice', message, ...args);
  }

  ai(message: string, ...args: unknown[]): void {
    this.info('AI', message, ...args);
  }

  chat(message: string, ...args: unknown[]): void {
    this.info('Chat', message, ...args);
  }

  // Performance logging
  performance(component: string, label: string, duration: number): void {
    this.debug(component, `⏱️ ${label}: ${duration}ms`);
  }

  // Enable/disable debug mode at runtime
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.logLevel = enabled ? LogLevel.DEBUG : LogLevel.INFO;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('spectra-debug', enabled.toString());
    }

    this.info('Logger', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  isDebugMode(): boolean {
    return this.debugMode;
  }
}

// Export singleton instance
export const logger = new SpectraLogger();

// Convenience functions for common logging
export const logVoice = (message: string, ...args: unknown[]) => logger.voice(message, ...args);
export const logAI = (message: string, ...args: unknown[]) => logger.ai(message, ...args);
export const logChat = (message: string, ...args: unknown[]) => logger.chat(message, ...args);
export const logError = (component: string, message: string, ...args: unknown[]) => logger.error(component, message, ...args);
export const logPerformance = (component: string, label: string, duration: number) => logger.performance(component, label, duration);

// Global debug helper
if (typeof window !== 'undefined') {
  (window as typeof window & {
    spectraDebug?: {
      enable: () => void;
      disable: () => void;
      status: () => boolean;
    };
  }).spectraDebug = {
    enable: () => logger.setDebugMode(true),
    disable: () => logger.setDebugMode(false),
    status: () => logger.isDebugMode()
  };
}