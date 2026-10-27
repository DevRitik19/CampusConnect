import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 1.25rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '9999px',
              background: 'var(--danger-light, #fee2e2)',
              color: 'var(--danger, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <AlertTriangle size={28} strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              maxWidth: '420px',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
            }}
          >
            An unexpected error occurred while rendering this page. You can reload or return to the main feed.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={this.handleReload}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RotateCcw size={14} />
              <span>Reload Page</span>
            </button>
            <a href="/feed" className="btn btn-secondary btn-sm">
              Back to Feed
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
