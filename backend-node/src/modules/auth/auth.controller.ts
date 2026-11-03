import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/apiResponse';
import { ResponseMessages } from '../../constants/responseMessages';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.CREATED,
        message: ResponseMessages.REGISTER_SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.OK,
        message: ResponseMessages.LOGIN_SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      ApiResponse.send(res, {
        message: ResponseMessages.REFRESH_SUCCESS,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      ApiResponse.send(res, {
        message: ResponseMessages.LOGOUT_SUCCESS,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      ApiResponse.send(res, {
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
