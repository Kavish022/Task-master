/**
 * Unified API response and error contracts.
 */

export interface NormalizedApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
