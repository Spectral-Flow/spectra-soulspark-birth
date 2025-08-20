/**
 * Enhanced Error Boundary with Comprehensive Diagnostics
 * Integrates with SPECTRA's troubleshooting system
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Copy, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import { diagnostics } from '@/lib/diagnostics';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  diagnosticReport: any;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      diagnosticReport: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Report to diagnostics system
    diagnostics.addError(
      'react-boundary',
      error.message,
      error.stack
    );

    // Generate diagnostic report
    try {
      const diagnosticReport = await diagnostics.generateFullReport();
      this.setState({ diagnosticReport });
    } catch (reportError) {
      console.error('Failed to generate diagnostic report:', reportError);
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external services if available
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Example: Send to error tracking service
    interface SentryGlobal {
      captureException: (error: Error, context?: object) => void;
    }
    
    if (typeof window !== 'undefined' && (window as unknown as { Sentry?: SentryGlobal }).Sentry) {
      const Sentry = (window as unknown as { Sentry: SentryGlobal }).Sentry;
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          errorBoundary: true,
          errorId: this.state.errorId
        }
      });
    }

    // Log to console with detailed information
    console.group('🚨 React Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error ID:', this.state.errorId);
    console.groupEnd();
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      diagnosticReport: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorReport = async () => {
    try {
      const report = await this.generateErrorReport();
      await navigator.clipboard.writeText(report);
      alert('Error report copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy error report:', error);
    }
  };

  private async generateErrorReport(): Promise<string> {
    const { error, errorInfo, errorId, diagnosticReport } = this.state;
    
    const sections = [
      '# SPECTRA Error Report',
      `Error ID: ${errorId}`,
      `Timestamp: ${new Date().toISOString()}`,
      '',
      '## Error Details',
      `**Message**: ${error?.message || 'Unknown error'}`,
      `**Stack Trace**:`,
      '```',
      error?.stack || 'No stack trace available',
      '```',
      '',
      '## Component Stack',
      '```',
      errorInfo?.componentStack || 'No component stack available',
      '```',
      '',
      '## System Information',
      diagnosticReport ? [
        `**Browser**: ${diagnosticReport.systemInfo.browser} ${diagnosticReport.systemInfo.version}`,
        `**Platform**: ${diagnosticReport.systemInfo.platform}`,
        `**Memory**: ${diagnosticReport.systemInfo.memory ? 
          Math.round(diagnosticReport.systemInfo.memory.used / 1024 / 1024) + 'MB used' : 
          'Not available'}`,
        '',
        '## Service Status',
        `**ElevenLabs**: ${diagnosticReport.serviceStatus.elevenlabs.available ? '✅' : '❌'}`,
        `**OpenAI**: ${diagnosticReport.serviceStatus.openai.available ? '✅' : '❌'}`,
        `**Backend**: ${diagnosticReport.serviceStatus.backend.available ? '✅' : '❌'}`,
        '',
        '## Environment Variables',
        ...Object.entries(diagnosticReport.environmentVariables).map(([key, value]: [string, any]) => 
          `**${key}**: ${value ? '✅' : '❌'}`
        ),
      ] : ['Diagnostic report not available'],
      '',
      '## Debugging Steps',
      '1. Check browser console for additional errors',
      '2. Verify API keys are properly configured',
      '3. Ensure all required services are running',
      '4. Try refreshing the page',
      '5. Clear browser cache if issues persist',
    ].flat().filter(Boolean);

    return sections.join('\n');
  }

  private openTroubleshooting = () => {
    // This would open the troubleshooting interface
    console.log('Opening troubleshooting interface...');
    // In a real implementation, this would navigate to or open a modal
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, diagnosticReport } = this.state;

      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Bug className="w-6 h-6" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Something went wrong!</p>
                    <p className="text-sm">
                      {error?.message || 'An unexpected error occurred'}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="destructive">Error ID: {this.state.errorId}</Badge>
                      <Badge variant="outline">
                        {new Date().toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {diagnosticReport && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Quick System Check</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded border">
                      <span className="text-sm">Browser:</span>
                      <Badge variant="outline">
                        {diagnosticReport.systemInfo.browser}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded border">
                      <span className="text-sm">Backend:</span>
                      <Badge variant={diagnosticReport.serviceStatus.backend.available ? "default" : "destructive"}>
                        {diagnosticReport.serviceStatus.backend.available ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <details className="space-y-2">
                <summary className="cursor-pointer font-medium">
                  Technical Details
                </summary>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">Error Stack:</p>
                    <pre className="p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                      {error?.stack || 'No stack trace available'}
                    </pre>
                  </div>
                  {errorInfo?.componentStack && (
                    <div>
                      <p className="font-medium">Component Stack:</p>
                      <pre className="p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>

              <div className="space-y-3">
                <h4 className="font-semibold">What can you do?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={this.handleReload} variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                  <Button onClick={this.copyErrorReport} variant="outline" className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Error Report
                  </Button>
                  <Button onClick={this.openTroubleshooting} variant="outline" className="w-full">
                    <Terminal className="w-4 h-4 mr-2" />
                    Open Diagnostics
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <p className="font-medium mb-1">Debugging Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check browser console (F12) for additional errors</li>
                    <li>Verify your API keys are properly configured</li>
                    <li>Try running <code>showDiagnosticReport()</code> in the console</li>
                    <li>Clear browser cache and cookies if issues persist</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <span>SPECTRA Error Boundary v1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default EnhancedErrorBoundary;