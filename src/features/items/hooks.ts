import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { itemService } from '@/services';
import { queryClient } from '@/lib/queryClient';
import type { CreateItemDto, UpdateItemDto, ItemFilters } from './types';
import type { NormalizedApiError } from '@/types/api';

export const ITEMS_QUERY_KEYS = {
  all: ['items'] as const,
  lists: () => [...ITEMS_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: ItemFilters) => [...ITEMS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ITEMS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ITEMS_QUERY_KEYS.details(), id] as const,
};

export const useItemsQuery = (filters?: ItemFilters) => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEYS.list(filters),
    queryFn: () => itemService.list(filters),
  });
};

export const useItemQuery = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEYS.detail(id),
    queryFn: () => itemService.getById(id),
    enabled: options?.enabled ?? Boolean(id),
  });
};

export const useCreateItemMutation = () => {
  return useMutation({
    mutationFn: (dto: CreateItemDto) => itemService.create(dto),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.lists() });
      toast.success(`Item "${newItem.title}" created successfully!`);
    },
    onError: (error: NormalizedApiError) => {
      toast.error(error.message || 'Failed to create item.');
    },
  });
};

export const useUpdateItemMutation = () => {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateItemDto }) =>
      itemService.update(id, dto),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: ITEMS_QUERY_KEYS.detail(updatedItem.id),
      });
      toast.success(`Item "${updatedItem.title}" updated successfully!`);
    },
    onError: (error: NormalizedApiError) => {
      toast.error(error.message || 'Failed to update item.');
    },
  });
};

export const useDeleteItemMutation = () => {
  return useMutation({
    mutationFn: (id: string) => itemService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.lists() });
      toast.success('Item deleted successfully.');
    },
    onError: (error: NormalizedApiError) => {
      toast.error(error.message || 'Failed to delete item.');
    },
  });
};
