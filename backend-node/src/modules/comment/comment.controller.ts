import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comment.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class CommentController {
  static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const comment = await CommentService.addComment(taskId, req.user!.id, req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.CREATED,
        message: 'Comment added',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const comments = await CommentService.listComments(taskId);
      ApiResponse.send(res, { data: comments });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      const comment = await CommentService.updateComment(commentId, req.user!.id, req.body);
      ApiResponse.send(res, {
        message: 'Comment updated',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      await CommentService.deleteComment(commentId, req.user!.id);
      ApiResponse.send(res, {
        message: 'Comment deleted',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
