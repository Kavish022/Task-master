import type { IItemRepository } from '@/services/contracts/item.repository';
import type { Item, CreateItemDto, UpdateItemDto, ItemFilters } from '@/features/items/types';

export class ItemMockAdapter implements IItemRepository {
  private items: Item[] = [
    {
      id: 'item-1',
      title: 'Design Design System Tokens',
      description: 'Configure HSL color palettes, spacing tokens, and Tailwind darkMode class strategy.',
      status: 'completed',
      priority: 'high',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'item-2',
      title: 'Implement JWT Refresh Flow',
      description: 'Set up Axios response interceptor to intercept 401 and refresh expired access tokens seamlessly.',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'item-3',
      title: 'Configure React Hook Form & Zod',
      description: 'Add type-safe form validation schemas for authentication and dynamic item management.',
      status: 'completed',
      priority: 'medium',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async list(filters?: ItemFilters): Promise<Item[]> {
    await this.delay(150);
    let result = [...this.items];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((i) => i.status === filters.status);
    }
    return result;
  }

  async getById(id: string): Promise<Item> {
    await this.delay(100);
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      throw new Error(`Item with id "${id}" not found.`);
    }
    return item;
  }

  async create(dto: CreateItemDto): Promise<Item> {
    await this.delay(200);
    const newItem: Item = {
      id: `item-${Date.now()}`,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items = [newItem, ...this.items];
    return newItem;
  }

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    await this.delay(200);
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Item with id "${id}" not found.`);
    }
    const current = this.items[index]!;
    const updated: Item = {
      ...current,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.items[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    await this.delay(150);
    this.items = this.items.filter((i) => i.id !== id);
    return { success: true, id };
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
