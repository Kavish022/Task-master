import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind classes with conditional classes safely using clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format date string into readable format.
 */
export function formatDate(dateString: string | number | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, length = 60): string {
  if (!text || text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}
