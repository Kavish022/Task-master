import { z } from 'zod';
import { TaskStatus, TaskPriority, DependencyType } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(255).trim(),
  description: z.string().max(10000).optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: z.coerce.number().int().positive().optional(),
  parentTaskId: z.coerce.number().int().positive().optional(),
  estimatedMinutes: z.coerce.number().int().positive().optional(),
  labelIds: z.array(z.coerce.number().int().positive()).optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(2, 'Subtask title must be at least 2 characters').max(255).trim(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: z.coerce.number().int().positive().optional(),
  estimatedMinutes: z.coerce.number().int().positive().optional(),
  dueDate: z.coerce.date().optional(),
});

export const toggleTaskSchema = z.object({
  completed: z.boolean().optional(),
});

export const addDependencySchema = z.object({
  dependsOnTaskId: z.coerce.number().int().positive('Target task ID is required'),
  type: z.nativeEnum(DependencyType).default(DependencyType.BLOCKED_BY),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(255).trim().optional(),
  description: z.string().max(10000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.coerce.number().int().positive().nullable().optional(),
  parentTaskId: z.coerce.number().int().positive().nullable().optional(),
  estimatedMinutes: z.coerce.number().int().positive().nullable().optional(),
  actualMinutes: z.coerce.number().int().positive().nullable().optional(),
  labelIds: z.array(z.coerce.number().int().positive()).optional(),
  startDate: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  version: z.coerce.number().int().positive('Task version is required for optimistic locking'),
});

export const reorderTaskSchema = z.object({
  targetStatus: z.nativeEnum(TaskStatus),
  previousPosition: z.coerce.number().nullable().optional(),
  nextPosition: z.coerce.number().nullable().optional(),
  version: z.coerce.number().int().positive().optional(),
});

export const listTasksQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  isSubtask: z.enum(['true', 'false']).optional(),
  parentTaskId: z.coerce.number().int().positive().optional(),
  groupBy: z.enum(['status', 'none']).default('status'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type ToggleTaskInput = z.infer<typeof toggleTaskSchema>;
export type AddDependencyInput = z.infer<typeof addDependencySchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ReorderTaskInput = z.infer<typeof reorderTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
