import { Project, ProjectStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';

export class ProjectRepository {
  static async create(workspaceId: number, input: CreateProjectInput): Promise<Project> {
    return prisma.project.create({
      data: {
        workspaceId,
        name: input.name,
        key: input.key,
        description: input.description,
        status: input.status,
        startDate: input.startDate,
        targetDate: input.targetDate,
      },
    });
  }

  static async findById(id: number): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  static async findByKey(workspaceId: number, key: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { workspaceId, key, deletedAt: null },
    });
  }

  static async findWorkspaceProjects(workspaceId: number, status?: ProjectStatus) {
    return prisma.project.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...(status ? { status } : {}),
      },
      include: {
        _count: {
          select: {
            tasks: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async update(id: number, input: UpdateProjectInput): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
        ...(input.targetDate !== undefined ? { targetDate: input.targetDate } : {}),
      },
    });
  }

  static async softDelete(id: number): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async getProjectStats(projectId: number) {
    const tasks = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId, deletedAt: null },
      _count: { id: true },
    });

    const statusCounts = tasks.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalTasks = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const doneTasks = statusCounts['DONE'] || 0;
    const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      statusCounts,
      totalTasks,
      doneTasks,
      progressPercent,
    };
  }
}
