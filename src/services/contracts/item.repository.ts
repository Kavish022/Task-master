import type { Item, CreateItemDto, UpdateItemDto, ItemFilters } from '@/features/items/types';

/**
 * Transport-agnostic contract for item data access.
 * Implementations can be REST, GraphQL, WebSocket, or local mock without changing page components.
 */
export interface IItemRepository {
  list(filters?: ItemFilters): Promise<Item[]>;
  getById(id: string): Promise<Item>;
  create(dto: CreateItemDto): Promise<Item>;
  update(id: string, dto: UpdateItemDto): Promise<Item>;
  delete(id: string): Promise<{ success: boolean; id: string }>;
}
