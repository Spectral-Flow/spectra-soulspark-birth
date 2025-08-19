/**
 * Spectra Performance Monitor
 * Tracks performance metrics for voice and AI systems
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface VoiceMetrics {
  ttsLatency: number;
  sttLatency: number;
  serviceUsed: string;
  errorRate: number;
}

interface AIMetrics {
  responseTime: number;
  modelLoadTime: number;
  tokenCount: number;
  emotionDetectionTime: number;
}

class SpectraPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeTimers: Map<string, number> = new Map();
  private maxMetrics = 1000; // Keep last 1000 metrics

  // Start timing an operation
  startTimer(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.activeTimers.set(name, startTime);
    
    if (metadata) {
      this.activeTimers.set(`${name}_metadata`, metadata as any);
    }
  }

  // End timing and record metric
  endTimer(name: string): number {
    const endTime = performance.now();
    const startTime = this.activeTimers.get(name);
    
    if (!startTime) {
      logger.warn('Performance', `Timer '${name}' was not started`);
      return 0;
    }

    const duration = endTime - startTime;
    const metadata = (this.activeTimers.get(`${name}_metadata`) || {}) as Record<string, any>;

    this.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      metadata
    });

    // Cleanup
    this.activeTimers.delete(name);
    this.activeTimers.delete(`${name}_metadata`);

    logger.performance('Performance', name, duration);
    return duration;
  }

  // Record a metric directly
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Voice-specific performance tracking
  trackVoiceOperation<T>(
    operation: string,
    service: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.trackAsyncOperation(`voice_${operation}`, fn, { service });
  }

  // AI-specific performance tracking
  trackAIOperation<T>(
    operation: string,
    model: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.trackAsyncOperation(`ai_${operation}`, fn, { model });
  }

  // Generic async operation tracking
  async trackAsyncOperation<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name, metadata);
    
    try {
      const result = await fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      this.recordMetric({
        name: `${name}_error`,
        duration: 0,
        timestamp: Date.now(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  // Get performance summary
  getVoiceMetrics(): VoiceMetrics {
    const voiceMetrics = this.metrics.filter(m => m.name.startsWith('voice_'));
    const ttsMetrics = voiceMetrics.filter(m => m.name.includes('tts'));
    const sttMetrics = voiceMetrics.filter(m => m.name.includes('stt'));
    const errorMetrics = voiceMetrics.filter(m => m.name.includes('error'));

    return {
      ttsLatency: this.calculateAverage(ttsMetrics),
      sttLatency: this.calculateAverage(sttMetrics),
      serviceUsed: this.getMostUsedService(voiceMetrics),
      errorRate: errorMetrics.length / Math.max(voiceMetrics.length, 1)
    };
  }

  getAIMetrics(): AIMetrics {
    const aiMetrics = this.metrics.filter(m => m.name.startsWith('ai_'));
    const responseMetrics = aiMetrics.filter(m => m.name.includes('response'));
    const loadMetrics = aiMetrics.filter(m => m.name.includes('load'));
    const emotionMetrics = aiMetrics.filter(m => m.name.includes('emotion'));

    return {
      responseTime: this.calculateAverage(responseMetrics),
      modelLoadTime: this.calculateAverage(loadMetrics),
      tokenCount: this.calculateSum(responseMetrics, 'tokens'),
      emotionDetectionTime: this.calculateAverage(emotionMetrics)
    };
  }

  // Get recent metrics for debugging
  getRecentMetrics(count: number = 10): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    this.activeTimers.clear();
    logger.info('Performance', 'Metrics cleared');
  }

  // Export metrics for analysis
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      voice: this.getVoiceMetrics(),
      ai: this.getAIMetrics(),
      recent: this.getRecentMetrics(50),
      summary: this.getSummary()
    }, null, 2);
  }

  // Get overall performance summary
  getSummary(): Record<string, any> {
    const totalOperations = this.metrics.length;
    const errorCount = this.metrics.filter(m => m.name.includes('error')).length;
    const avgDuration = this.calculateAverage(this.metrics);

    return {
      totalOperations,
      errorCount,
      errorRate: errorCount / Math.max(totalOperations, 1),
      averageDuration: avgDuration,
      timespan: totalOperations > 0 ? 
        this.metrics[this.metrics.length - 1].timestamp - this.metrics[0].timestamp : 0
    };
  }

  // Helper methods
  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  private calculateSum(metrics: PerformanceMetric[], field: string): number {
    return metrics.reduce((acc, m) => {
      const value = m.metadata?.[field];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
  }

  private getMostUsedService(metrics: PerformanceMetric[]): string {
    const serviceCounts: Record<string, number> = {};
    
    metrics.forEach(m => {
      const service = m.metadata?.service;
      if (service) {
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      }
    });

    return Object.keys(serviceCounts).reduce((a, b) => 
      serviceCounts[a] > serviceCounts[b] ? a : b, 'unknown'
    );
  }
}

// Export singleton instance
export const performanceMonitor = new SpectraPerformanceMonitor();

// Convenience functions
export const trackVoice = <T>(operation: string, service: string, fn: () => Promise<T>) =>
  performanceMonitor.trackVoiceOperation(operation, service, fn);

export const trackAI = <T>(operation: string, model: string, fn: () => Promise<T>) =>
  performanceMonitor.trackAIOperation(operation, model, fn);

export const startTimer = (name: string, metadata?: Record<string, any>) =>
  performanceMonitor.startTimer(name, metadata);

export const endTimer = (name: string) =>
  performanceMonitor.endTimer(name);

// Global performance helpers
if (typeof window !== 'undefined') {
  (window as any).spectraPerformance = {
    getVoiceMetrics: () => performanceMonitor.getVoiceMetrics(),
    getAIMetrics: () => performanceMonitor.getAIMetrics(),
    export: () => performanceMonitor.exportMetrics(),
    clear: () => performanceMonitor.clearMetrics(),
    summary: () => performanceMonitor.getSummary()
  };
}