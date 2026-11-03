import { apiClient } from '@/lib/axios';
import { ENDPOINTS } from '@/config/endpoints';
import type { Item, CreateItemDto, UpdateItemDto, ItemFilters } from './types';

export const itemsApi = {
  list: async (filters?: ItemFilters): Promise<Item[]> => {
    const res = await apiClient.get(ENDPOINTS.ITEMS.LIST, {
      params: filters,
    });
    const payload = res.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  },

  getById: async (id: string): Promise<Item> => {
    const res = await apiClient.get(ENDPOINTS.ITEMS.DETAIL(id));
    return res.data?.data ?? res.data;
  },

  create: async (dto: CreateItemDto): Promise<Item> => {
    const res = await apiClient.post(ENDPOINTS.ITEMS.CREATE, dto);
    return res.data?.data ?? res.data;
  },

  update: async (id: string, dto: UpdateItemDto): Promise<Item> => {
    const res = await apiClient.put(ENDPOINTS.ITEMS.UPDATE(id), dto);
    return res.data?.data ?? res.data;
  },

  delete: async (id: string): Promise<{ success: boolean; id: string }> => {
    const res = await apiClient.delete(ENDPOINTS.ITEMS.DELETE(id));
    return res.data?.data ?? res.data ?? { success: true, id };
  },
};
