import { z } from 'zod';
import { ItemStatus, ItemPriority } from '@prisma/client';

export const createItemSchema = z.object({
  title: z
    .string({ required_error: 'Item title is required' })
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title cannot exceed 255 characters')
    .trim(),
  description: z.string().max(5000, 'Description cannot exceed 5000 characters').optional().nullable(),
  status: z.nativeEnum(ItemStatus).default(ItemStatus.draft),
  priority: z.nativeEnum(ItemPriority).default(ItemPriority.medium),
});

export const updateItemSchema = z.object({
  title: z.string().min(2).max(255).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(ItemStatus).optional(),
  priority: z.nativeEnum(ItemPriority).optional(),
});

export const listItemsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.union([z.nativeEnum(ItemStatus), z.literal('all')]).optional(),
  priority: z.nativeEnum(ItemPriority).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const itemIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Item ID must be a positive integer'),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
export type ItemIdParam = z.infer<typeof itemIdParamSchema>;

