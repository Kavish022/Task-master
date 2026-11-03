import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemSchema, type ItemFormData } from '../schemas';
import type { Item } from '../types';
import { Modal, Input, Button } from '@/components/ui';

export interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => void;
  isLoading: boolean;
  itemToEdit?: Item | null;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  itemToEdit,
}) => {
  const isEditing = Boolean(itemToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        reset({
          title: itemToEdit.title,
          description: itemToEdit.description,
          status: itemToEdit.status,
          priority: itemToEdit.priority,
        });
      } else {
        reset({
          title: '',
          description: '',
          status: 'draft',
          priority: 'medium',
        });
      }
    }
  }, [isOpen, itemToEdit, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Item' : 'Create New Item'}
      description={
        isEditing
          ? 'Update the details for this item below.'
          : 'Fill in the information below to add a new item to your catalog.'
      }
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <Input
          label="Title"
          placeholder="e.g. Design API Architecture"
          required
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Detailed description of the item..."
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Status select */}
          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('status')}
            >
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            {errors.status && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Priority select */}
          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Priority <span className="text-rose-500">*</span>
            </label>
            <select
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
