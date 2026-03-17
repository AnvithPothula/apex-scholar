import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/UIComponents';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-base-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-base-850 rounded-md p-8 border border-border text-center">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-error-400 mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="text-2xl font-bold text-content-primary mb-2">Oops! Something went wrong</h2>
              <p className="text-content-secondary text-sm">
                The scheduler encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-content-primary hover:bg-content-primary text-base-950"
              >
                <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-content-muted text-sm cursor-pointer hover:text-content-secondary">
                  Developer Info (Click to expand)
                </summary>
                <div className="mt-2 p-3 bg-base-900/50 rounded-lg text-xs text-error-300 font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
