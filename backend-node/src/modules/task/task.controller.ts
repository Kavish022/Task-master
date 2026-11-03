import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { ListTasksQuery } from './task.validation';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class TaskController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const query = req.query as unknown as ListTasksQuery;
      const tasks = await TaskService.listTasks(projectId, query);
      ApiResponse.send(res, { data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const task = await TaskService.getTaskById(taskId);
      ApiResponse.send(res, { data: task });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const task = await TaskService.createTask(projectId, req.user!.id, req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.CREATED,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const updated = await TaskService.updateTask(taskId, req.user!.id, req.body);
      ApiResponse.send(res, {
        message: 'Task updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const updated = await TaskService.reorderTask(taskId, req.user!.id, req.body);
      ApiResponse.send(res, {
        message: 'Task reordered successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      await TaskService.deleteTask(taskId);
      ApiResponse.send(res, {
        message: 'Task deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSubtask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const subtask = await TaskService.createSubtask(taskId, req.user!.id, req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.CREATED,
        message: 'Subtask created successfully',
        data: subtask,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const task = await TaskService.toggleTask(taskId, req.user!.id, req.body);
      ApiResponse.send(res, {
        message: 'Task status updated',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const dependency = await TaskService.addDependency(taskId, req.user!.id, req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.CREATED,
        message: 'Dependency added successfully',
        data: dependency,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dependencyId = parseInt(req.params.dependencyId, 10);
      const result = await TaskService.removeDependency(dependencyId);
      ApiResponse.send(res, {
        message: 'Dependency removed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
