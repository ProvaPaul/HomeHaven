import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

// Router-level error page (chunk load failures, render errors in routes)
export default function RouteError() {
  const error = useRouteError();
  console.error('Route error:', error);

  const isChunkError = /dynamically imported module|Loading chunk/i.test(error?.message || '');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
        {isChunkError ? 'Update available' : 'Something went wrong'}
      </h1>
      <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
        {isChunkError
          ? 'The app has been updated since you loaded this page. Refresh to get the latest version.'
          : 'An unexpected error occurred while loading this page.'}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
      </div>
    </div>
  );
}
