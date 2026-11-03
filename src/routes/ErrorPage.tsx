import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export const ErrorPage: React.FC = () => {
  const error = useRouteError();

  let errorMessage = 'An unexpected error occurred while loading this route.';
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light px-4 py-16 text-center dark:bg-surface-dark transition-colors">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-5">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
        Status {statusCode}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        Route Encountered an Error
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {errorMessage}
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
