import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useItemQuery, useUpdateItemMutation, useDeleteItemMutation } from './hooks';
import type { ItemStatus, ItemPriority } from './types';
import type { ItemFormData } from './schemas';
import { ItemFormModal } from './components/ItemFormModal';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ConfirmDialog,
  Spinner,
  type BadgeVariant,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';

const statusBadgeMap: Record<ItemStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
};

const priorityBadgeMap: Record<ItemPriority, { variant: BadgeVariant; label: string }> = {
  low: { variant: 'info', label: 'Low Priority' },
  medium: { variant: 'warning', label: 'Medium Priority' },
  high: { variant: 'danger', label: 'High Priority' },
};

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: item, isLoading, isError, error } = useItemQuery(id ?? '');
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItemMutation();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItemMutation();

  const handleUpdate = (formData: ItemFormData) => {
    if (!item) return;
    updateItem(
      { id: item.id, dto: formData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!item) return;
    deleteItem(item.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        navigate('/items', { replace: true });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <Spinner size="lg" variant="primary" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading item details...
        </p>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-950/60 dark:bg-rose-950/20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-rose-900 dark:text-rose-200">
          Item not found
        </h2>
        <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
          {error instanceof Error
            ? error.message
            : 'The requested item could not be retrieved.'}
        </p>
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={() => navigate('/items')}>
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusBadgeMap[item.status] || {
    variant: 'default',
    label: item.status,
  };
  const priorityInfo = priorityBadgeMap[item.priority] || {
    variant: 'default',
    label: item.priority,
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with back button and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/items"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Items</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="h-4 w-4" />}
          >
            Edit Item
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Item Card */}
      <Card className="overflow-hidden">
        <CardHeader className="space-y-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {item.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Description
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="font-medium">Created On</p>
                <p className="text-slate-400 dark:text-slate-500">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <p className="font-medium">Last Modified</p>
                <p className="text-slate-400 dark:text-slate-500">
                  {formatDate(item.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form Modal */}
      <ItemFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
        itemToEdit={item}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${item.title}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ItemDetailPage;
