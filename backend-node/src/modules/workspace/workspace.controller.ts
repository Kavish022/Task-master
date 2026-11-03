import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class WorkspaceController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await WorkspaceService.createWorkspace(req.user!.id, req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.CREATED,
        message: 'Workspace created successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listUserWorkspaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaces = await WorkspaceService.getUserWorkspaces(req.user!.id);
      ApiResponse.send(res, { data: workspaces });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = parseInt(req.params.workspaceId, 10);
      const workspace = await WorkspaceService.getWorkspaceById(workspaceId);
      ApiResponse.send(res, { data: workspace });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await WorkspaceService.getWorkspaceBySlug(req.params.slug);
      ApiResponse.send(res, { data: workspace });
    } catch (error) {
      next(error);
    }
  }

  static async listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = parseInt(req.params.workspaceId, 10);
      const members = await WorkspaceService.getMembers(workspaceId);
      ApiResponse.send(res, { data: members });
    } catch (error) {
      next(error);
    }
  }

  static async inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = parseInt(req.params.workspaceId, 10);
      const member = await WorkspaceService.inviteMember(workspaceId, req.user!.id, req.body);
      ApiResponse.send(res, {
        statusCode: HttpStatus.CREATED,
        message: 'Member invited successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = parseInt(req.params.workspaceId, 10);
      const targetUserId = parseInt(req.params.userId, 10);
      const updated = await WorkspaceService.updateMemberRole(workspaceId, targetUserId, req.body);
      ApiResponse.send(res, {
        message: 'Member role updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = parseInt(req.params.workspaceId, 10);
      const targetUserId = parseInt(req.params.userId, 10);
      await WorkspaceService.removeMember(workspaceId, targetUserId);
      ApiResponse.send(res, {
        message: 'Member removed from workspace successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = parseInt(req.params.workspaceId, 10);
      const updated = await WorkspaceService.updateWorkspace(workspaceId, req.body);
      ApiResponse.send(res, {
        message: 'Workspace updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = parseInt(req.params.workspaceId, 10);
      await WorkspaceService.deleteWorkspace(workspaceId);
      ApiResponse.send(res, {
        message: 'Workspace deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
