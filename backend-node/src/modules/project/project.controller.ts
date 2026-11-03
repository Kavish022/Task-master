import { Request, Response, NextFunction } from 'express';
import { ProjectStatus } from '@prisma/client';
import { ProjectService } from './project.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class ProjectController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceMember!.workspaceId;
      const project = await ProjectService.createProject(workspaceId, req.user!.id, req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.CREATED,
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceMember!.workspaceId;
      const status = req.query.status as ProjectStatus | undefined;
      const projects = await ProjectService.listWorkspaceProjects(workspaceId, status);
      ApiResponse.send(res, { data: projects });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const project = await ProjectService.getProjectById(projectId);
      ApiResponse.send(res, { data: project });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const updated = await ProjectService.updateProject(projectId, req.body);
      ApiResponse.send(res, {
        message: 'Project updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      await ProjectService.deleteProject(projectId);
      ApiResponse.send(res, {
        message: 'Project archived/deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
