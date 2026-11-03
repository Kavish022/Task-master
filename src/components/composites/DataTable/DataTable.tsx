import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  keyExtractor?: (row: T, index: number) => string | number;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records matching your current criteria.',
  emptyAction,
  onRowClick,
  keyExtractor = (row, idx) => (row['id'] ? String(row['id']) : idx),
  className,
}: DataTableProps<T>): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3 rounded-xl border border-slate-200/80 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <Spinner size="lg" variant="primary" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-3.5', col.headerClassName)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, index) => {
              const key = keyExtractor(row, index);
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'transition-colors',
                    isClickable
                      ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  )}
                >
                  {columns.map((col) => {
                    const cellValue = col.render
                      ? col.render(row, index)
                      : String(row[col.key] ?? '');

                    return (
                      <td
                        key={col.key}
                        className={cn('px-4 py-3 text-slate-700 dark:text-slate-200', col.className)}
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
