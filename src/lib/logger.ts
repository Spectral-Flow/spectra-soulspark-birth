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

class SpectraLogger {
  private debugMode: boolean;
  private logLevel: LogLevel;

  constructor() {
    // Check for debug mode from environment or localStorage
    this.debugMode = 
      import.meta.env.VITE_DEBUG === 'true' ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('spectra-debug') === 'true') ||
      import.meta.env.DEV;
    
    this.logLevel = this.debugMode ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, component: string, message: string): string {
    const timestamp = new Date().toISOString().slice(11, 23);
    return `[${timestamp}] ${level} [${component}] ${message}`;
  }

  debug(component: string, message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', component, message), ...args);
    }
  }

  info(component: string, message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', component, message), ...args);
    }
  }

  warn(component: string, message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', component, message), ...args);
    }
  }

  error(component: string, message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', component, message), ...args);
    }
  }

  // Voice-specific logging helpers
  voice(message: string, ...args: any[]): void {
    this.info('Voice', message, ...args);
  }

  ai(message: string, ...args: any[]): void {
    this.info('AI', message, ...args);
  }

  chat(message: string, ...args: any[]): void {
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
export const logVoice = (message: string, ...args: any[]) => logger.voice(message, ...args);
export const logAI = (message: string, ...args: any[]) => logger.ai(message, ...args);
export const logChat = (message: string, ...args: any[]) => logger.chat(message, ...args);
export const logError = (component: string, message: string, ...args: any[]) => logger.error(component, message, ...args);
export const logPerformance = (component: string, label: string, duration: number) => logger.performance(component, label, duration);

// Global debug helper
if (typeof window !== 'undefined') {
  (window as any).spectraDebug = {
    enable: () => logger.setDebugMode(true),
    disable: () => logger.setDebugMode(false),
    status: () => logger.isDebugMode()
  };
}