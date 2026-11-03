export type ItemStatus = 'draft' | 'in_progress' | 'completed';
export type ItemPriority = 'low' | 'medium' | 'high';

export interface Item {
  id: string;
  title: string;
  description: string;
  status: ItemStatus;
  priority: ItemPriority;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDto {
  title: string;
  description: string;
  status: ItemStatus;
  priority: ItemPriority;
}

export type UpdateItemDto = Partial<CreateItemDto>;

export interface ItemFilters {
  search?: string;
  status?: ItemStatus | 'all';
}
