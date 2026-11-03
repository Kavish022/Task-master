import { TaskStatus } from '@prisma/client';
import { TaskRepository } from './task.repository';
import {
  CreateTaskInput,
  UpdateTaskInput,
  ReorderTaskInput,
  ListTasksQuery,
  CreateSubtaskInput,
  ToggleTaskInput,
  AddDependencyInput,
} from './task.validation';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/apiError';
import { ProjectRepository } from '../project/project.repository';
import { prisma } from '../../config/db';

export class TaskService {
  static async listTasks(projectId: number, query: ListTasksQuery) {
    const tasks = await TaskRepository.findProjectTasks(projectId, query);

    if (query.groupBy === 'status') {
      const grouped: Record<TaskStatus, typeof tasks> = {
        BACKLOG: [],
        TODO: [],
        IN_PROGRESS: [],
        IN_REVIEW: [],
        DONE: [],
        CANCELLED: [],
      };

      for (const task of tasks) {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        }
      }

      return grouped;
    }

    return tasks;
  }

  static async getTaskById(taskId: number) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  static async createTask(projectId: number, creatorId: number, input: CreateTaskInput) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project with ID ${projectId} not found`);
    }

    // Assignee validation: ensure assignee belongs to the project's workspace
    if (input.assigneeId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          uq_workspace_member: {
            workspaceId: project.workspaceId,
            userId: input.assigneeId,
          },
        },
      });

      if (!membership || membership.membershipStatus !== 'ACTIVE') {
        throw new BadRequestError('Assignee must be an active member of this workspace');
      }
    }

    // Determine position at the end of the target column
    const existingInColumn = await prisma.task.findMany({
      where: { projectId, status: input.status, deletedAt: null },
      orderBy: { position: 'desc' },
      take: 1,
    });

    const initialPosition =
      existingInColumn.length > 0
        ? Number(existingInColumn[0].position) + 10000.0
        : 65535.0;

    const task = await TaskRepository.createWithKeyAndLabels(
      projectId,
      creatorId,
      project.key,
      input,
      initialPosition
    );

    // If assigned to someone else, trigger notification
    if (input.assigneeId && input.assigneeId !== creatorId) {
      await prisma.notification.create({
        data: {
          userId: input.assigneeId,
          eventType: 'TASK_ASSIGNED',
          payload: {
            taskId: task.id,
            taskKey: task.taskKey,
            title: task.title,
            assignedBy: creatorId,
          },
        },
      });
    }

    return task;
  }

  static async updateTask(taskId: number, userId: number, input: UpdateTaskInput) {
    const existing = await TaskRepository.findById(taskId);
    if (!existing) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }

    const updated = await TaskRepository.updateWithOptimisticLock(
      taskId,
      userId,
      existing,
      input
    );

    if (!updated) {
      throw new ConflictError(
        'Concurrency conflict: This task was modified by another user. Please reload the latest task state.'
      );
    }

    // If newly assigned, notify assignee
    if (
      input.assigneeId &&
      input.assigneeId !== existing.assigneeId &&
      input.assigneeId !== userId
    ) {
      await prisma.notification.create({
        data: {
          userId: input.assigneeId,
          eventType: 'TASK_ASSIGNED',
          payload: {
            taskId: updated.id,
            taskKey: updated.taskKey,
            title: updated.title,
            assignedBy: userId,
          },
        },
      });
    }

    return updated;
  }

  static async reorderTask(taskId: number, userId: number, input: ReorderTaskInput) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }

    const { targetStatus, previousPosition, nextPosition } = input;
    let newPosition: number;

    // Fractional indexing midpoint algorithm
    if (previousPosition !== null && previousPosition !== undefined && nextPosition !== null && nextPosition !== undefined) {
      newPosition = (previousPosition + nextPosition) / 2;
    } else if (previousPosition !== null && previousPosition !== undefined) {
      newPosition = previousPosition + 10000.0;
    } else if (nextPosition !== null && nextPosition !== undefined) {
      newPosition = nextPosition > 10000.0 ? nextPosition - 10000.0 : nextPosition / 2;
    } else {
      newPosition = 65535.0; // Dropped into empty column
    }

    return TaskRepository.updatePosition(
      taskId,
      userId,
      targetStatus,
      newPosition,
      task.status
    );
  }

  static async deleteTask(taskId: number) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }
    return TaskRepository.softDelete(taskId);
  }

  static async createSubtask(
    parentTaskId: number,
    creatorId: number,
    input: CreateSubtaskInput
  ) {
    const parent = await TaskRepository.findById(parentTaskId);
    if (!parent) {
      throw new NotFoundError(`Parent task with ID ${parentTaskId} not found`);
    }

    // Invariant: Max depth is 1 (subtask cannot have subtasks)
    if (parent.parentTaskId) {
      throw new BadRequestError('Subtasks cannot contain nested child subtasks');
    }

    // Validate assignee if provided
    if (input.assigneeId) {
      const project = await ProjectRepository.findById(parent.projectId);
      if (project) {
        const membership = await prisma.workspaceMember.findUnique({
          where: {
            uq_workspace_member: {
              workspaceId: project.workspaceId,
              userId: input.assigneeId,
            },
          },
        });
        if (!membership || membership.membershipStatus !== 'ACTIVE') {
          throw new BadRequestError('Assignee must be an active member of this workspace');
        }
      }
    }

    return TaskRepository.createSubtask(parent, creatorId, input);
  }

  static async toggleTask(
    taskId: number,
    userId: number,
    input: ToggleTaskInput
  ) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }
    return TaskRepository.toggleStatus(task, userId, input.completed);
  }

  static async addDependency(
    taskId: number,
    _userId: number,
    input: AddDependencyInput
  ) {
    if (taskId === input.dependsOnTaskId) {
      throw new BadRequestError('A task cannot depend on itself');
    }

    const [sourceTask, targetTask] = await Promise.all([
      TaskRepository.findById(taskId),
      TaskRepository.findById(input.dependsOnTaskId),
    ]);

    if (!sourceTask) {
      throw new NotFoundError(`Task with ID ${taskId} not found`);
    }
    if (!targetTask) {
      throw new NotFoundError(`Target task with ID ${input.dependsOnTaskId} not found`);
    }

    // Check if dependency already exists
    const existing = await prisma.taskDependency.findUnique({
      where: {
        uq_task_dependency: {
          taskId,
          dependsOnTaskId: input.dependsOnTaskId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('This dependency relationship already exists');
    }

    // Cycle detection: check if targetTask already transitively blocks sourceTask
    const isCyclic = await TaskService.detectCycle(taskId, input.dependsOnTaskId);
    if (isCyclic) {
      throw new ConflictError('Cannot add dependency: circular dependency detected');
    }

    return TaskRepository.addDependency(taskId, input.dependsOnTaskId, input.type);
  }

  static async removeDependency(dependencyId: number) {
    const existing = await TaskRepository.findDependencyById(dependencyId);
    if (!existing) {
      throw new NotFoundError(`Dependency with ID ${dependencyId} not found`);
    }
    await TaskRepository.removeDependency(dependencyId);
    return { success: true, id: dependencyId };
  }

  private static async detectCycle(
    sourceTaskId: number,
    targetTaskId: number
  ): Promise<boolean> {
    const visited = new Set<number>();
    const queue = [targetTaskId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === sourceTaskId) {
        return true; // Cycle detected!
      }
      visited.add(current);

      const dependencies = await prisma.taskDependency.findMany({
        where: { taskId: current },
        select: { dependsOnTaskId: true },
      });

      for (const dep of dependencies) {
        if (!visited.has(dep.dependsOnTaskId)) {
          queue.push(dep.dependsOnTaskId);
        }
      }
    }

    return false;
  }
}
