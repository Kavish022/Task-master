import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(150).trim(),
  key: z
    .string()
    .min(2, 'Key must be 2 to 10 uppercase characters')
    .max(10)
    .toUpperCase()
    .regex(/^[A-Z0-9]+$/, 'Project key must contain only uppercase alphanumeric characters (e.g. ENG, CLOUD)'),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(150).trim().optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
