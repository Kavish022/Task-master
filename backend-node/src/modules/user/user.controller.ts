import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ListUsersQuery } from './user.validation';
import { ApiResponse } from '../../utils/apiResponse';

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getProfile(req.user!.id);
      ApiResponse.send(res, { data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await UserService.updateProfile(req.user!.id, req.body);
      ApiResponse.send(res, {
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListUsersQuery;
      const result = await UserService.listUsers(query);
      ApiResponse.paginated(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
