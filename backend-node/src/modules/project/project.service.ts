import { ProjectStatus } from '@prisma/client';
import { ProjectRepository } from './project.repository';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';
import { ConflictError, NotFoundError } from '../../utils/apiError';
import { prisma } from '../../config/db';

export class ProjectService {
  static async createProject(
    workspaceId: number,
    userId: number,
    input: CreateProjectInput
  ) {
    const existing = await ProjectRepository.findByKey(workspaceId, input.key);
    if (existing) {
      throw new ConflictError(
        `A project with key "${input.key}" already exists in this workspace`
      );
    }

    const project = await ProjectRepository.create(workspaceId, input);

    // Audit log
    await prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        action: 'PROJECT_CREATED',
        metadata: { projectId: project.id, name: project.name, key: project.key },
      },
    });

    return project;
  }

  static async getProjectById(projectId: number) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    const stats = await ProjectRepository.getProjectStats(projectId);
    return { ...project, stats };
  }

  static async listWorkspaceProjects(workspaceId: number, status?: ProjectStatus) {
    return ProjectRepository.findWorkspaceProjects(workspaceId, status);
  }

  static async updateProject(projectId: number, input: UpdateProjectInput) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    return ProjectRepository.update(projectId, input);
  }

  static async deleteProject(projectId: number) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    return ProjectRepository.softDelete(projectId);
  }
}
