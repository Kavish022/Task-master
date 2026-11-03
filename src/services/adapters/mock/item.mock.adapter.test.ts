import { describe, it, expect, beforeEach } from 'vitest';
import { ItemMockAdapter } from './item.mock.adapter';

describe('ItemMockAdapter (IItemRepository Implementation)', () => {
  let adapter: ItemMockAdapter;

  beforeEach(() => {
    adapter = new ItemMockAdapter();
  });

  it('lists existing items', async () => {
    const items = await adapter.list();
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0]).toHaveProperty('id');
    expect(items[0]).toHaveProperty('title');
  });

  it('creates and returns a new item', async () => {
    const created = await adapter.create({
      title: 'Repository Unit Test',
      description: 'Verifying transport decoupling',
      status: 'in_progress',
      priority: 'high',
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Repository Unit Test');

    const fetched = await adapter.getById(created.id);
    expect(fetched.title).toBe('Repository Unit Test');
  });

  it('deletes an item', async () => {
    const created = await adapter.create({
      title: 'Item to delete',
      description: 'Will be deleted',
      status: 'draft',
      priority: 'low',
    });

    const result = await adapter.delete(created.id);
    expect(result.success).toBe(true);

    await expect(adapter.getById(created.id)).rejects.toThrow();
  });
});
