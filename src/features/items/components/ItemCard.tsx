import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, ArrowUpRight, Calendar } from 'lucide-react';
import type { Item, ItemStatus, ItemPriority } from '../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  type BadgeVariant,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';

export interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

const statusBadgeMap: Record<ItemStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
};

const priorityBadgeMap: Record<ItemPriority, { variant: BadgeVariant; label: string }> = {
  low: { variant: 'info', label: 'Low' },
  medium: { variant: 'warning', label: 'Medium' },
  high: { variant: 'danger', label: 'High' },
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  const statusInfo = statusBadgeMap[item.status] || {
    variant: 'default',
    label: item.status,
  };
  const priorityInfo = priorityBadgeMap[item.priority] || {
    variant: 'default',
    label: item.priority,
  };

  return (
    <Card className="flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-brand-500/40 group">
      <div>
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <Badge variant={priorityInfo.variant}>Priority: {priorityInfo.label}</Badge>
          </div>
          <Link
            to={`/items/${item.id}`}
            className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-1"
            title="View item details"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardHeader>

        <CardContent className="space-y-2 pt-2">
          <Link to={`/items/${item.id}`} className="block">
            <CardTitle className="line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {item.title}
            </CardTitle>
          </Link>
          <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {item.description}
          </p>
        </CardContent>
      </div>

      <CardFooter className="pt-3 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(item.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label={`Edit ${item.title}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
            aria-label={`Delete ${item.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};
