import { Request, Response, NextFunction } from 'express';
import { ItemService } from './item.service';
import { ListItemsQuery, CreateItemInput, UpdateItemInput } from './item.validation';
import { ApiResponse } from '../../utils/apiResponse';

export class ItemController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListItemsQuery;
      const userId = req.user?.id;
      const result = await ItemService.listItems(query, userId);
      ApiResponse.paginated(res, result, 'Items retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await ItemService.getItemById(id);
      ApiResponse.send(res, { data: item });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateItemInput;
      const userId = req.user?.id;
      const item = await ItemService.createItem(body, userId);
      ApiResponse.created(res, item, 'Item created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body as UpdateItemInput;
      const item = await ItemService.updateItem(id, body);
      ApiResponse.send(res, {
        message: 'Item updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await ItemService.deleteItem(id);
      ApiResponse.send(res, {
        message: 'Item deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async stats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const stats = await ItemService.getItemStats(userId);
      ApiResponse.send(res, { data: stats });
    } catch (error) {
      next(error);
    }
  }
}

