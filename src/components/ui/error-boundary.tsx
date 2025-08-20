/**
 * Spectra Error Boundary
 * Provides graceful error handling for React components
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class SpectraErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log error details
    logger.error('ErrorBoundary', `Caught error: ${error.message}`, {
      error: error.toString(),
      errorInfo,
      stack: error.stack,
      errorId: this.state.errorId
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo
    });

    // Send error to monitoring service if available
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
  }

  private handleRetry = () => {
    logger.info('ErrorBoundary', 'User triggered error recovery');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReload = () => {
    logger.info('ErrorBoundary', 'User triggered page reload');
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Card className="max-w-2xl mx-auto mt-8 border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Something went wrong</CardTitle>
                <CardDescription>
                  SPECTRA encountered an unexpected error. Don't worry, your conversation is safe.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showDetails && error && (
              <div className="p-4 rounded-md bg-muted text-sm">
                <p className="font-medium mb-2">Error Details:</p>
                <p className="text-destructive font-mono">{error.message}</p>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Component Stack</summary>
                    <pre className="mt-2 text-xs overflow-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                Reload Page
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>If this problem persists, try:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Refreshing the page</li>
                <li>Clearing your browser cache</li>
                <li>Checking your internet connection</li>
                <li>Trying a different browser</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <SpectraErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </SpectraErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specialized error boundaries for different sections
export const VoiceErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <SpectraErrorBoundary
    onError={(error, errorInfo) => {
      logger.error('Voice', 'Voice system error caught by boundary', { error, errorInfo });
    }}
    fallback={
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Voice System Unavailable</p>
              <p className="text-sm text-amber-600">
                The voice system encountered an error. You can still chat using text.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    }
  >
    {children}
  </SpectraErrorBoundary>
);

export const AIErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <SpectraErrorBoundary
    onError={(error, errorInfo) => {
      logger.error('AI', 'AI system error caught by boundary', { error, errorInfo });
    }}
    fallback={
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">AI System Unavailable</p>
              <p className="text-sm text-blue-600">
                SPECTRA's AI is currently unavailable. Fallback responses will be used.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    }
  >
    {children}
  </SpectraErrorBoundary>
);