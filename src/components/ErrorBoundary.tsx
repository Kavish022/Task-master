import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // In production, send to your telemetry service (e.g. Sentry, Datadog)
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-light p-6 dark:bg-surface-dark transition-colors">
          <div className="w-full max-w-lg rounded-2xl border border-rose-200/80 bg-white p-8 shadow-xl dark:border-rose-950/60 dark:bg-slate-900 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 mb-5">
              <AlertOctagon className="h-8 w-8" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              An unexpected client error occurred. Our team has been notified.
            </p>

            {this.state.error && (
              <div className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-left font-mono text-xs text-rose-700 dark:bg-slate-950 dark:text-rose-400 border border-slate-200 dark:border-slate-800">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleReset}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
