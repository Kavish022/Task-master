import { z } from 'zod';

export const itemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters long')
    .max(500, 'Description cannot exceed 500 characters'),
  status: z.enum(['draft', 'in_progress', 'completed'] as const, {
    required_error: 'Please select a status',
  }),
  priority: z.enum(['low', 'medium', 'high'] as const, {
    required_error: 'Please select a priority',
  }),
});

export type ItemFormData = z.infer<typeof itemSchema>;
