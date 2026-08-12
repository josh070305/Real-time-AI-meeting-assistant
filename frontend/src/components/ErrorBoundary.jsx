import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-dark-400 mb-6">
              We're sorry for the inconvenience. Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-dark-400 cursor-pointer mb-2">Error details</summary>
                <pre className="text-xs text-error-300 bg-error-500/10 p-4 rounded-xl overflow-auto max-h-64">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
