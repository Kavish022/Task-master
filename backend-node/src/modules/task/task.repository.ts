import { Task, TaskStatus, Prisma, DependencyType } from '@prisma/client';
import { prisma } from '../../config/db';
import { CreateTaskInput, UpdateTaskInput, ListTasksQuery, CreateSubtaskInput } from './task.validation';

const taskIncludeRelations = Prisma.validator<Prisma.TaskInclude>()({
  assignee: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  creator: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  labels: {
    include: {
      label: true,
    },
  },
  _count: {
    select: {
      subtasks: { where: { deletedAt: null } },
      comments: { where: { deletedAt: null } },
      attachments: true,
    },
  },
});

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof taskIncludeRelations;
}>;

const taskDetailInclude = Prisma.validator<Prisma.TaskInclude>()({
  ...taskIncludeRelations,
  subtasks: {
    where: { deletedAt: null },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
    },
  },
  comments: {
    where: { deletedAt: null },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  },
  history: {
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  },
  dependencies: {
    include: {
      dependsOnTask: {
        select: { id: true, taskKey: true, title: true, status: true, priority: true },
      },
    },
  },
  dependentOn: {
    include: {
      task: {
        select: { id: true, taskKey: true, title: true, status: true, priority: true },
      },
    },
  },
});

export type TaskDetail = Prisma.TaskGetPayload<{
  include: typeof taskDetailInclude;
}>;

export class TaskRepository {
  static async findById(id: number): Promise<TaskDetail | null> {
    return prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: taskDetailInclude,
    });
  }

  static async findByTaskKey(
    projectId: number,
    taskKey: string
  ): Promise<TaskWithRelations | null> {
    return prisma.task.findFirst({
      where: { projectId, taskKey, deletedAt: null },
      include: taskIncludeRelations,
    });
  }

  static async findProjectTasks(
    projectId: number,
    query: ListTasksQuery
  ): Promise<TaskWithRelations[]> {
    const { status, priority, assigneeId, search, isSubtask, parentTaskId } = query;

    const where: Prisma.TaskWhereInput = {
      projectId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(assigneeId ? { assigneeId } : {}),
      ...(parentTaskId ? { parentTaskId } : {}),
      ...(isSubtask === 'false' ? { parentTaskId: null } : {}),
      ...(isSubtask === 'true' ? { parentTaskId: { not: null } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { taskKey: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };

    return prisma.task.findMany({
      where,
      include: taskIncludeRelations,
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });
  }

  static async createWithKeyAndLabels(
    projectId: number,
    creatorId: number,
    projectKey: string,
    input: CreateTaskInput,
    initialPosition: number
  ): Promise<TaskWithRelations> {
    return prisma.$transaction(async (tx) => {
      // 1. Calculate taskKey atomically
      const count = await tx.task.count({ where: { projectId } });
      const taskKey = `${projectKey}-${count + 1}`;

      // 2. Create Task
      const task = await tx.task.create({
        data: {
          projectId,
          creatorId,
          taskKey,
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          position: new Prisma.Decimal(initialPosition.toFixed(4)),
          assigneeId: input.assigneeId,
          parentTaskId: input.parentTaskId,
          estimatedMinutes: input.estimatedMinutes,
          startDate: input.startDate,
          dueDate: input.dueDate,
          labels: input.labelIds && input.labelIds.length > 0
            ? {
                create: input.labelIds.map((labelId) => ({ labelId })),
              }
            : undefined,
        },
        include: taskIncludeRelations,
      });

      // 3. Write initial history event
      await tx.taskHistory.create({
        data: {
          taskId: task.id,
          changedBy: creatorId,
          fieldName: 'status',
          oldValue: null,
          newValue: task.status,
        },
      });

      return task;
    });
  }

  static async updateWithOptimisticLock(
    taskId: number,
    userId: number,
    existingTask: Task,
    input: UpdateTaskInput
  ): Promise<TaskWithRelations | null> {
    return prisma.$transaction(async (tx) => {
      // 1. Optimistic locking check: update where version matches
      const updated = await tx.task.updateMany({
        where: {
          id: taskId,
          version: input.version,
          deletedAt: null,
        },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.priority !== undefined ? { priority: input.priority } : {}),
          ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
          ...(input.parentTaskId !== undefined ? { parentTaskId: input.parentTaskId } : {}),
          ...(input.estimatedMinutes !== undefined ? { estimatedMinutes: input.estimatedMinutes } : {}),
          ...(input.actualMinutes !== undefined ? { actualMinutes: input.actualMinutes } : {}),
          ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
          ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
          ...(input.completedAt !== undefined ? { completedAt: input.completedAt } : {}),
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        return null; // Version conflict!
      }

      // 2. Sync label mappings if provided
      if (input.labelIds !== undefined) {
        await tx.taskLabelMapping.deleteMany({ where: { taskId } });
        if (input.labelIds.length > 0) {
          await tx.taskLabelMapping.createMany({
            data: input.labelIds.map((labelId) => ({ taskId, labelId })),
          });
        }
      }

      // 3. Write structured field-level diffs into TaskHistory
      const diffs: { field: string; oldVal: string | null; newVal: string | null }[] = [];

      if (input.status && input.status !== existingTask.status) {
        diffs.push({ field: 'status', oldVal: existingTask.status, newVal: input.status });
      }
      if (input.priority && input.priority !== existingTask.priority) {
        diffs.push({ field: 'priority', oldVal: existingTask.priority, newVal: input.priority });
      }
      if (input.title && input.title !== existingTask.title) {
        diffs.push({ field: 'title', oldVal: existingTask.title, newVal: input.title });
      }
      if (input.assigneeId !== undefined && input.assigneeId !== existingTask.assigneeId) {
        diffs.push({
          field: 'assigneeId',
          oldVal: existingTask.assigneeId ? String(existingTask.assigneeId) : 'unassigned',
          newVal: input.assigneeId ? String(input.assigneeId) : 'unassigned',
        });
      }

      for (const diff of diffs) {
        await tx.taskHistory.create({
          data: {
            taskId,
            changedBy: userId,
            fieldName: diff.field,
            oldValue: diff.oldVal,
            newValue: diff.newVal,
          },
        });
      }

      return tx.task.findUnique({
        where: { id: taskId },
        include: taskIncludeRelations,
      });
    });
  }

  static async updatePosition(
    taskId: number,
    userId: number,
    newStatus: TaskStatus,
    newPosition: number,
    oldStatus: TaskStatus
  ): Promise<TaskWithRelations> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: taskId },
        data: {
          status: newStatus,
          position: new Prisma.Decimal(newPosition.toFixed(4)),
          ...(newStatus === 'DONE' && oldStatus !== 'DONE' ? { completedAt: new Date() } : {}),
          ...(newStatus !== 'DONE' && oldStatus === 'DONE' ? { completedAt: null } : {}),
          version: { increment: 1 },
        },
        include: taskIncludeRelations,
      });

      if (newStatus !== oldStatus) {
        await tx.taskHistory.create({
          data: {
            taskId,
            changedBy: userId,
            fieldName: 'status',
            oldValue: oldStatus,
            newValue: newStatus,
          },
        });
      }

      return updated;
    });
  }

  static async softDelete(taskId: number): Promise<Task> {
    return prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });
  }

  static async createSubtask(
    parentTask: Task,
    creatorId: number,
    input: CreateSubtaskInput
  ): Promise<TaskWithRelations> {
    return prisma.$transaction(async (tx) => {
      // 1. Calculate subtask key (e.g. ENG-3-1)
      const count = await tx.task.count({ where: { parentTaskId: parentTask.id } });
      const taskKey = `${parentTask.taskKey}-${count + 1}`;
      // 2. Compute initial position (place at end of subtask list)
      const lastSubtask = await tx.task.findFirst({
        where: { parentTaskId: parentTask.id, deletedAt: null },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      const initialPosition = lastSubtask ? Number(lastSubtask.position) + 1000 : 1000;
      // 3. Create subtask
      const subtask = await tx.task.create({
        data: {
          projectId: parentTask.projectId,
          creatorId,
          parentTaskId: parentTask.id,
          taskKey,
          title: input.title,
          status: TaskStatus.TODO,
          priority: input.priority,
          position: new Prisma.Decimal(initialPosition.toFixed(4)),
          assigneeId: input.assigneeId,
          estimatedMinutes: input.estimatedMinutes,
          dueDate: input.dueDate,
        },
        include: taskIncludeRelations,
      });
      // 4. Log creation history on subtask
      await tx.taskHistory.create({
        data: {
          taskId: subtask.id,
          changedBy: creatorId,
          fieldName: 'status',
          oldValue: null,
          newValue: TaskStatus.TODO,
        },
      });
      // 5. Also log subtask addition on parent task
      await tx.taskHistory.create({
        data: {
          taskId: parentTask.id,
          changedBy: creatorId,
          fieldName: 'subtask',
          oldValue: null,
          newValue: `Added subtask ${taskKey}: ${input.title}`,
        },
      });
      return subtask;
    });
  }
  static async toggleStatus(
    task: Task,
    userId: number,
    completed?: boolean
  ): Promise<TaskWithRelations> {
    const isCurrentlyDone = task.status === TaskStatus.DONE;
    const shouldBeDone = completed !== undefined ? completed : !isCurrentlyDone;
    const newStatus = shouldBeDone ? TaskStatus.DONE : TaskStatus.TODO;
    return prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: task.id },
        data: {
          status: newStatus,
          completedAt: shouldBeDone ? new Date() : null,
          version: { increment: 1 },
        },
        include: taskIncludeRelations,
      });
      await tx.taskHistory.create({
        data: {
          taskId: task.id,
          changedBy: userId,
          fieldName: 'status',
          oldValue: task.status,
          newValue: newStatus,
        },
      });

      return updated;
    });
  }
  static async addDependency(
    taskId: number,
    dependsOnTaskId: number,
    type: DependencyType
  ) {
    return prisma.taskDependency.create({
      data: {
        taskId,
        dependsOnTaskId,
        type,
      },
      include: {
        dependsOnTask: {
          select: { id: true, taskKey: true, title: true, status: true, priority: true },
        },
      },
    });
  }
  static async removeDependency(dependencyId: number) {
    return prisma.taskDependency.delete({
      where: { id: dependencyId },
    });
  }
  static async findDependencyById(dependencyId: number) {
    return prisma.taskDependency.findUnique({
      where: { id: dependencyId },
    });
  }
}
