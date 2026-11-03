import { ItemRepository } from './item.repository';
import { CreateItemInput, UpdateItemInput, ListItemsQuery } from './item.validation';
import { NotFoundError } from '../../utils/apiError';

export class ItemService {
  static async listItems(query: ListItemsQuery, userId?: number) {
    return ItemRepository.findManyPaginated(query, userId);
  }

  static async getItemById(id: number) {
    const item = await ItemRepository.findById(id);
    if (!item) {
      throw new NotFoundError(`Item with ID ${id} not found`);
    }
    return item;
  }

  static async createItem(input: CreateItemInput, userId?: number) {
    return ItemRepository.create({
      ...input,
      userId,
    });
  }

  static async updateItem(id: number, input: UpdateItemInput) {
    const existing = await ItemRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Item with ID ${id} not found`);
    }
    return ItemRepository.update(id, input);
  }

  static async deleteItem(id: number) {
    const existing = await ItemRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Item with ID ${id} not found`);
    }
    await ItemRepository.delete(id);
    return { success: true, id };
  }

  static async getItemStats(userId?: number) {
    return ItemRepository.getStats(userId);
  }
}

