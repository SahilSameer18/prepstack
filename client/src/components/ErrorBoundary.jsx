import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

/**
 * ErrorBoundary — catches any uncaught render/lifecycle errors in the tree
 * and shows a styled fallback UI instead of a blank white screen.
 *
 * Wrap your entire <App /> (in main.jsx) with this component.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you could send this to a monitoring service (Sentry, etc.)
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate to home to give the user a clean slate
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FiAlertTriangle style={{ fontSize: 36, color: '#f87171' }} />
        </div>

        {/* Copy */}
        <div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Oops — something went wrong
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 400, lineHeight: 1.6 }}>
            An unexpected error occurred. Our team has been notified. Try going
            back to the home page.
          </p>

          {/* Show error message in development */}
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                marginTop: 16,
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 10,
                color: '#fca5a5',
                fontSize: 12,
                textAlign: 'left',
                maxWidth: 480,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={this.handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #ffa116, #ff8c00)',
            color: '#000',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <FiRefreshCw style={{ fontSize: 14 }} />
          Back to Home
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
