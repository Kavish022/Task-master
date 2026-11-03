import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, CheckCircle2, Clock, Plus, ArrowRight, Shield, Zap } from 'lucide-react';
import { useAuthStore, selectCurrentUser } from '@/features/auth/store';
import { useItemsQuery } from '@/features/items/hooks';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Spinner } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { ENV } from '@/config/env';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore(selectCurrentUser);
  const { data: items = [], isLoading } = useItemsQuery();

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center space-y-4">
        <Spinner size="xl" variant="primary" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Loading dashboard metrics...
        </p>
      </div>
    );
  }

  const totalCount = items.length;
  const inProgressCount = items.filter((i) => i.status === 'in_progress').length;
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const recentItems = items.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-amber-300" />
            <span>Production Architecture Ready</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {user?.name || 'Developer'}!
          </h1>
          <p className="text-sm text-brand-100">
            Your frontend is fully configured with Zustand client state, TanStack Query
            server caching, JWT refresh rotation interceptors, and strict TypeScript.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/kanban">
              <Button
                variant="secondary"
                size="sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="bg-white text-brand-900 hover:bg-brand-50 font-semibold shadow-md"
              >
                Open Kanban Board
              </Button>
            </Link>
            <Link to="/items">
              <Button
                variant="outline"
                size="sm"
                className="border-white/40 text-white hover:bg-white/10"
              >
                Browse Items
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="absolute right-12 bottom-0 h-36 w-36 rounded-full bg-indigo-500/30 blur-xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Items
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                In Progress
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {inProgressCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {completedCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                API Mode
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {ENV.enableMockApi ? 'Demo Mock' : 'Live REST'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items & Quick Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Items List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Items</CardTitle>
              <Link
                to="/items"
                className="text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentItems.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  No items available yet.
                </p>
              ) : (
                recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="space-y-0.5">
                      <Link
                        to={`/items/${item.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400 transition-colors"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.status === 'completed'
                          ? 'success'
                          : item.status === 'in_progress'
                            ? 'warning'
                            : 'default'
                      }
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips / Architecture Card */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Architecture Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex gap-2.5">
                <div className="h-2 w-2 rounded-full bg-brand-500 mt-1 shrink-0" />
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">
                    Endpoints Registry:
                  </strong>{' '}
                  Edit{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800 font-mono">
                    src/config/endpoints.ts
                  </code>{' '}
                  to adapt endpoints to any backend.
                </p>
              </div>

              <div className="flex gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">
                    JWT Interceptor:
                  </strong>{' '}
                  On 401, automatically queues requests and calls{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800 font-mono">
                    /auth/refresh
                  </code>
                  .
                </p>
              </div>

              <div className="flex gap-2.5">
                <div className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">
                    Zustand Persist:
                  </strong>{' '}
                  Auth session persists in localStorage with typed selectors.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/items">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Manage Items
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
