/**
 * SPECTRA Comprehensive Diagnostics System
 * Provides automated troubleshooting and debugging tools
 */

interface SystemInfo {
  browser: string;
  version: string;
  platform: string;
  language: string;
  userAgent: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface RuntimeVersions {
  node?: string;
  npm?: string;
  browser: string;
  webGL?: string;
  webGPU?: boolean;
}

export interface ServiceStatus {
  elevenlabs: {
    available: boolean;
    apiKey: boolean;
    error?: string;
  };
  openai: {
    available: boolean;
    apiKey: boolean;
    error?: string;
  };
  webSpeech: {
    available: boolean;
    speechSynthesis: boolean;
    speechRecognition: boolean;
    error?: string;
  };
  backend: {
    available: boolean;
    healthy: boolean;
    endpoints: Record<string, boolean>;
    error?: string;
  };
}

export interface DiagnosticReport {
  timestamp: string;
  version: string;
  systemInfo: SystemInfo;
  runtimeVersions: RuntimeVersions;
  serviceStatus: ServiceStatus;
  environmentVariables: Record<string, boolean>;
  errors: Array<{
    type: string;
    message: string;
    stack?: string;
    timestamp: string;
  }>;
  recommendations: string[];
}

export class SpectraDiagnostics {
  private errors: Array<{
    type: string;
    message: string;
    stack?: string;
    timestamp: string;
  }> = [];

  constructor() {
    this.setupErrorCapture();
  }

  private setupErrorCapture(): void {
    // Capture global errors
    window.addEventListener('error', (event) => {
      this.addError('javascript', event.message, event.error?.stack);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addError('promise', event.reason?.message || 'Unhandled promise rejection', event.reason?.stack);
    });
  }

  addError(type: string, message: string, stack?: string): void {
    this.errors.push({
      type,
      message,
      stack,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift();
    }
  }

  async getSystemInfo(): Promise<SystemInfo> {
    const nav = navigator as any;
    
    return {
      browser: this.getBrowserName(),
      version: this.getBrowserVersion(),
      platform: navigator.platform,
      language: navigator.language,
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
      memory: nav.memory ? {
        used: nav.memory.usedJSHeapSize,
        total: nav.memory.totalJSHeapSize,
        limit: nav.memory.jsHeapSizeLimit,
      } : undefined,
    };
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(): string {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  async getRuntimeVersions(): Promise<RuntimeVersions> {
    return {
      browser: `${this.getBrowserName()} ${this.getBrowserVersion()}`,
      webGL: this.getWebGLVersion(),
      webGPU: await this.checkWebGPUSupport(),
    };
  }

  private getWebGLVersion(): string | undefined {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const version = (gl as any).getParameter((gl as any).VERSION);
        return version;
      }
    } catch (error) {
      // Ignore
    }
    return undefined;
  }

  private async checkWebGPUSupport(): Promise<boolean> {
    try {
      return 'gpu' in navigator && !!(navigator as any).gpu;
    } catch (error) {
      return false;
    }
  }

  async checkServiceStatus(): Promise<ServiceStatus> {
    const status: ServiceStatus = {
      elevenlabs: await this.checkElevenLabsStatus(),
      openai: await this.checkOpenAIStatus(),
      webSpeech: this.checkWebSpeechStatus(),
      backend: await this.checkBackendStatus(),
    };

    return status;
  }

  private async checkElevenLabsStatus() {
    try {
      const hasKey = !!(
        import.meta.env.VITE_ELEVENLABS_API_KEY ||
        (window as any).ELEVENLABS_API_KEY
      );

      return {
        available: true,
        apiKey: hasKey,
        error: hasKey ? undefined : 'API key not configured'
      };
    } catch (error) {
      return {
        available: false,
        apiKey: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkOpenAIStatus() {
    try {
      const hasKey = !!(
        import.meta.env.VITE_OPENAI_API_KEY ||
        (window as any).OPENAI_API_KEY
      );

      return {
        available: true,
        apiKey: hasKey,
        error: hasKey ? undefined : 'API key not configured'
      };
    } catch (error) {
      return {
        available: false,
        apiKey: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private checkWebSpeechStatus() {
    try {
      const speechSynthesis = 'speechSynthesis' in window;
      const speechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

      return {
        available: speechSynthesis || speechRecognition,
        speechSynthesis,
        speechRecognition,
        error: (!speechSynthesis && !speechRecognition) ? 'Web Speech API not supported' : undefined
      };
    } catch (error) {
      return {
        available: false,
        speechSynthesis: false,
        speechRecognition: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkBackendStatus() {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000,
      } as any);

      if (!response.ok) {
        throw new Error(`Backend health check failed: ${response.status}`);
      }

      const health = await response.json();
      
      // Test individual endpoints
      const endpoints = {
        health: true,
        elevenlabs: await this.testEndpoint('/api/elevenlabs/voices'),
        openai: await this.testEndpoint('/api/openai/tts'),
        auth: await this.testEndpoint('/api/auth/user'),
      };

      return {
        available: true,
        healthy: health.status === 'healthy',
        endpoints,
        error: health.status !== 'healthy' ? 'Backend unhealthy' : undefined
      };
    } catch (error) {
      return {
        available: false,
        healthy: false,
        endpoints: {},
        error: error instanceof Error ? error.message : 'Backend not available'
      };
    }
  }

  private async testEndpoint(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        timeout: 3000,
      } as any);
      
      // Consider 4xx as available but misconfigured, 5xx as not available
      return response.status < 500;
    } catch (error) {
      return false;
    }
  }

  getEnvironmentStatus(): Record<string, boolean> {
    const env = import.meta.env;
    
    return {
      'VITE_ELEVENLABS_API_KEY': !!env.VITE_ELEVENLABS_API_KEY,
      'VITE_OPENAI_API_KEY': !!env.VITE_OPENAI_API_KEY,
      'VITE_SUPABASE_URL': !!env.VITE_SUPABASE_URL,
      'VITE_SUPABASE_ANON_KEY': !!env.VITE_SUPABASE_ANON_KEY,
      'VITE_ELEVENLABS_AGENT_ID': !!env.VITE_ELEVENLABS_AGENT_ID,
      'VITE_DEBUG': !!env.VITE_DEBUG,
    };
  }

  generateRecommendations(serviceStatus: ServiceStatus, envStatus: Record<string, boolean>): string[] {
    const recommendations: string[] = [];

    // ElevenLabs recommendations
    if (!serviceStatus.elevenlabs.apiKey) {
      recommendations.push('Set VITE_ELEVENLABS_API_KEY environment variable for premium voice features');
    }

    // OpenAI recommendations
    if (!serviceStatus.openai.apiKey) {
      recommendations.push('Set VITE_OPENAI_API_KEY environment variable for enhanced AI capabilities');
    }

    // Web Speech recommendations
    if (!serviceStatus.webSpeech.available) {
      recommendations.push('Use a modern browser with Web Speech API support for voice features');
    }

    // Backend recommendations
    if (!serviceStatus.backend.available) {
      recommendations.push('Start the backend server with `npm run dev:backend` for full functionality');
    }

    // Environment recommendations
    if (!envStatus['VITE_ELEVENLABS_AGENT_ID']) {
      recommendations.push('Configure VITE_ELEVENLABS_AGENT_ID for conversation features');
    }

    // Memory recommendations
    if (this.errors.length > 10) {
      recommendations.push('Multiple errors detected - check browser console for details');
    }

    return recommendations;
  }

  async generateFullReport(): Promise<DiagnosticReport> {
    const [systemInfo, runtimeVersions, serviceStatus] = await Promise.all([
      this.getSystemInfo(),
      this.getRuntimeVersions(),
      this.checkServiceStatus(),
    ]);

    const envStatus = this.getEnvironmentStatus();
    const recommendations = this.generateRecommendations(serviceStatus, envStatus);

    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      systemInfo,
      runtimeVersions,
      serviceStatus,
      environmentVariables: envStatus,
      errors: [...this.errors],
      recommendations,
    };
  }

  async generateMarkdownReport(): Promise<string> {
    const report = await this.generateFullReport();
    
    const sections = [
      '# SPECTRA Diagnostic Report',
      `Generated: ${report.timestamp}`,
      '',
      '## System Information',
      `- **Browser**: ${report.systemInfo.browser} ${report.systemInfo.version}`,
      `- **Platform**: ${report.systemInfo.platform}`,
      `- **Language**: ${report.systemInfo.language}`,
      `- **Screen**: ${report.systemInfo.screen.width}x${report.systemInfo.screen.height}`,
      report.systemInfo.memory ? `- **Memory**: ${Math.round(report.systemInfo.memory.used / 1024 / 1024)}MB used` : '',
      '',
      '## Runtime Versions',
      `- **Browser**: ${report.runtimeVersions.browser}`,
      `- **WebGL**: ${report.runtimeVersions.webGL || 'Not available'}`,
      `- **WebGPU**: ${report.runtimeVersions.webGPU ? 'Supported' : 'Not supported'}`,
      '',
      '## Service Status',
      `- **ElevenLabs**: ${report.serviceStatus.elevenlabs.available ? '✅' : '❌'} ${report.serviceStatus.elevenlabs.apiKey ? '(API Key: ✅)' : '(API Key: ❌)'}`,
      `- **OpenAI**: ${report.serviceStatus.openai.available ? '✅' : '❌'} ${report.serviceStatus.openai.apiKey ? '(API Key: ✅)' : '(API Key: ❌)'}`,
      `- **Web Speech**: ${report.serviceStatus.webSpeech.available ? '✅' : '❌'} (TTS: ${report.serviceStatus.webSpeech.speechSynthesis ? '✅' : '❌'}, STT: ${report.serviceStatus.webSpeech.speechRecognition ? '✅' : '❌'})`,
      `- **Backend**: ${report.serviceStatus.backend.available ? '✅' : '❌'} ${report.serviceStatus.backend.healthy ? '(Healthy)' : '(Unhealthy)'}`,
      '',
      '## Environment Variables',
      ...Object.entries(report.environmentVariables).map(([key, value]) => 
        `- **${key}**: ${value ? '✅ Set' : '❌ Not set'}`
      ),
      '',
      '## Recent Errors',
      report.errors.length === 0 
        ? '- No recent errors ✅'
        : report.errors.slice(-5).map(error => 
            `- **${error.type}**: ${error.message} (${error.timestamp})`
          ).join('\n'),
      '',
      '## Recommendations',
      ...report.recommendations.map(rec => `- ${rec}`),
      '',
      '## Debugging Commands',
      '```javascript',
      '// Test voice system',
      'const diagnostics = new SpectraDiagnostics();',
      'await diagnostics.generateFullReport();',
      '',
      '// Test specific services',
      'testSpectraVoice();',
      'testElevenLabsVoice();',
      'testApiKeys();',
      '```',
    ].filter(Boolean);

    return sections.join('\n');
  }

  // Export report for sharing
  exportReport(): string {
    return JSON.stringify(this.generateFullReport(), null, 2);
  }
}

// Global diagnostics instance
export const diagnostics = new SpectraDiagnostics();

// Console commands for debugging
(window as any).SpectraDiagnostics = SpectraDiagnostics;
(window as any).diagnostics = diagnostics;

// Convenience functions
(window as any).generateDiagnosticReport = () => diagnostics.generateFullReport();
(window as any).showDiagnosticReport = async () => {
  const report = await diagnostics.generateMarkdownReport();
  console.log(report);
  return report;
};

console.log('🔧 SPECTRA Diagnostics loaded. Use showDiagnosticReport() for troubleshooting.');