import React from 'react';
import { Spinner } from './Spinner';
import { cn } from '@/lib/utils';

export interface LoadingScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading application...',
  fullScreen = true,
  className,
  ...props
}) => {
  return (
    <div
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center transition-colors',
        fullScreen
          ? 'fixed inset-0 z-50 h-screen w-screen bg-slate-950/90 backdrop-blur-md text-white'
          : 'h-full min-h-[300px] w-full py-12 bg-transparent text-slate-700 dark:text-slate-300',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="xl" variant="primary" />
        <p className="text-sm font-medium text-slate-200 dark:text-slate-300 animate-pulse text-center">
          {message}
        </p>
      </div>
    </div>
  );
};
