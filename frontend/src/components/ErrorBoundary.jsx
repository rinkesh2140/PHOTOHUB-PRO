// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ERROR BOUNDARY CAUGHT:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Send to error tracking service (Sentry, LogRocket, etc)
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Details:');
      console.error(error);
      console.error(errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-red-500 rounded-lg shadow-xl max-w-md w-full p-8">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Oops! Something Went Wrong
            </h1>

            <p className="text-gray-300 text-center mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-slate-900 rounded p-4 mb-4 text-xs text-red-300 font-mono overflow-auto max-h-48">
                <p className="font-bold mb-2">Error Message:</p>
                <p>{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <>
                    <p className="font-bold mt-2 mb-2">Stack Trace:</p>
                    <p className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</p>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded transition"
              >
                Go Home
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <p className="text-yellow-500 text-sm text-center mt-4">
                ⚠️ Multiple errors detected. Please contact support if problem persists.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
