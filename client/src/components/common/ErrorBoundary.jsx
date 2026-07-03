import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-w-xl overflow-x-auto rounded-lg bg-gray-100 p-4 text-left text-xs text-red-600 dark:bg-gray-900 dark:text-red-400">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Back to home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
