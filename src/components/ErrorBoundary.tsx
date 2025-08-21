import React from 'react';
import { logger } from '@/lib/logger';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log using Spectra logger
    logger.error('ErrorBoundary', error.message, info);
    // Optionally send telemetry to backend (left as integration point)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h2 style={{ marginBottom: 8 }}>Something went wrong.</h2>
          <p style={{ color: '#666', marginBottom: 12 }}>The app encountered an unexpected error. Try refreshing the page.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 12px', background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 6 }}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
