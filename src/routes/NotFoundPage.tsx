import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light px-4 py-16 text-center dark:bg-surface-dark transition-colors">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 mb-6">
        <Compass className="h-10 w-10 animate-pulse" />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        404 Error
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
        moved, deleted, or doesn&apos;t exist.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
