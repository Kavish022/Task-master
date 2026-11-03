import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  avatarUrl: z.string().url().optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
