/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * SPECTRA Startup Diagnostics
 * Automatically checks system health on application startup
 */

import './diagnostics';

interface StartupCheck {
  name: string;
  description: string;
  check: () => Promise<boolean> | boolean;
  critical: boolean;
  fixCommand?: string;
}

class StartupDiagnostics {
  private checks: StartupCheck[] = [
    {
      name: 'Browser Compatibility',
      description: 'Check if browser supports required features',
      check: this.checkBrowserCompatibility,
      critical: true,
    },
    {
      name: 'Environment Variables',
      description: 'Verify API keys and configuration',
      check: this.checkEnvironmentVariables,
      critical: false,
      fixCommand: 'Set VITE_ELEVENLABS_API_KEY and VITE_OPENAI_API_KEY'
    },
    {
      name: 'Web Speech API',
      description: 'Check Web Speech API support',
      check: this.checkWebSpeechAPI,
      critical: false,
    },
    {
      name: 'Audio Context',
      description: 'Test Web Audio API availability',
      check: this.checkAudioContext,
      critical: false,
    },
    {
      name: 'Backend Connectivity',
      description: 'Test backend API endpoints',
      check: this.checkBackendConnectivity,
      critical: false,
      fixCommand: 'Start backend with: npm run dev:backend'
    },
    {
      name: 'Local Storage',
      description: 'Verify browser storage availability',
      check: this.checkLocalStorage,
      critical: true,
    },
    {
      name: 'WebGL Support',
      description: 'Check WebGL for AI model acceleration',
      check: this.checkWebGLSupport,
      critical: false,
    },
  ];

  async runStartupDiagnostics(): Promise<void> {
    console.group('🚀 SPECTRA Startup Diagnostics');
    
    const results = [];
    let criticalFailures = 0;
    let warnings = 0;

    for (const check of this.checks) {
      try {
        console.log(`🔍 Checking: ${check.name}...`);
        const result = await check.check();
        
        results.push({
          ...check,
          passed: result,
          timestamp: new Date().toISOString()
        });

        if (result) {
          console.log(`✅ ${check.name}: OK`);
        } else {
          if (check.critical) {
            console.error(`❌ ${check.name}: FAILED (Critical)`);
            criticalFailures++;
          } else {
            console.warn(`⚠️ ${check.name}: FAILED (Warning)`);
            warnings++;
          }
          
          if (check.fixCommand) {
            console.log(`💡 Fix: ${check.fixCommand}`);
          }
        }
      } catch (error) {
        console.error(`💥 ${check.name}: ERROR -`, error);
        results.push({
          ...check,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        
        if (check.critical) {
          criticalFailures++;
        } else {
          warnings++;
        }
      }
    }

    console.log('\n📊 Startup Diagnostic Summary:');
    console.log(`✅ Passed: ${results.filter(r => r.passed).length}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`❌ Critical Failures: ${criticalFailures}`);
    
    if (criticalFailures > 0) {
      console.error('\n🚨 Critical issues detected! SPECTRA may not function properly.');
      console.log('Run showDiagnosticReport() for detailed troubleshooting.');
    } else if (warnings > 0) {
      console.warn('\n⚠️ Some features may be limited due to configuration issues.');
      console.log('Run showDiagnosticReport() for optimization suggestions.');
    } else {
      console.log('\n🎉 All systems operational! SPECTRA is ready.');
    }

    console.groupEnd();

    // Store results for later reference
    (window as any).startupDiagnosticResults = results;
    
    // Show user notification if needed
    this.showUserNotification(criticalFailures, warnings);
  }

  private showUserNotification(criticalFailures: number, _warnings: number): void {
    if (criticalFailures > 0) {
      const message = `SPECTRA startup detected ${criticalFailures} critical issue(s). Some features may not work properly. Check console for details.`;
      
      // Show a non-blocking notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SPECTRA Startup Issues', {
          body: message,
          icon: '/favicon.ico'
        });
      } else {
        console.warn('🔔 ' + message);
      }
    }
  }

  private checkBrowserCompatibility(): boolean {
    const requiredFeatures = [
      'fetch',
      'Promise',
      'localStorage',
      'addEventListener',
      'AudioContext',
    ];

    return requiredFeatures.every(feature => {
      const available = (feature in window) || (feature in globalThis);
      if (!available) {
        console.warn(`Missing required feature: ${feature}`);
      }
      return available;
    });
  }

  private checkEnvironmentVariables(): boolean {
    const env = import.meta.env;
    
    // Check for at least one voice API key
    const hasVoiceAPI = !!(
      env.VITE_ELEVENLABS_API_KEY || 
      env.VITE_OPENAI_API_KEY ||
      (window as any).ELEVENLABS_API_KEY ||
      (window as any).OPENAI_API_KEY
    );

    return hasVoiceAPI;
  }

  private checkWebSpeechAPI(): boolean {
    return (
      'speechSynthesis' in window ||
      'SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window
    );
  }

  private checkAudioContext(): boolean {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;
      
      const context = new AudioContextClass();
      context.close();
      return true;
    } catch {
      return false;
    }
  }

  private async checkBackendConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/health', {
        signal: controller.signal,
        method: 'GET',
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private checkLocalStorage(): boolean {
    try {
      const test = 'spectra-test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }
}

export const startupDiagnostics = new StartupDiagnostics();

// Auto-run diagnostics when module loads
if (typeof window !== 'undefined') {
  // Run diagnostics after a short delay to allow app initialization
  setTimeout(() => {
    startupDiagnostics.runStartupDiagnostics();
  }, 1000);
}

// Make available globally for debugging
(window as any).startupDiagnostics = startupDiagnostics;
(window as any).runStartupDiagnostics = () => startupDiagnostics.runStartupDiagnostics();

console.log('🔧 SPECTRA Startup Diagnostics loaded. Use runStartupDiagnostics() to run checks manually.');