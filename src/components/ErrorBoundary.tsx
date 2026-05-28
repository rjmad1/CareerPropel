'use client'

import { Component, ErrorInfo, ReactNode } from 'react';
import { logClientError, getClientCorrelationId } from '@/lib/logging/clientLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Lightweight React class-based ErrorBoundary for localized UI containment.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn(`[ErrorBoundary:${this.props.name || 'default'}] Caught render exception.`);
    logClientError(error, errorInfo.componentStack || undefined);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      const correlationId = getClientCorrelationId();

      return (
        <div
          id={`error-boundary-${this.props.name || 'default'}`}
          style={{
            padding: '1.5rem',
            margin: '1rem 0',
            borderRadius: '8px',
            border: '1px solid #fee2e2',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
            Something went wrong
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#7f1d1d' }}>
            An error occurred in component {this.props.name || 'unnamed'}.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Retry
            </button>
            <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
              ID: {correlationId}
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
