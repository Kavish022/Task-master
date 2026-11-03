/**
 * Centralized API endpoints registry.
 * Modify these paths when matching your backend REST API specifications.
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
 WORKSPACES: {
    LIST: '/workspaces',
    CREATE: '/workspaces',
    DETAIL: (id: string | number) => `/workspaces/${id}`,
    PROJECTS: (workspaceId: string | number) => `/workspaces/${workspaceId}/projects`,
    CREATE_PROJECT: (workspaceId: string | number) => `/workspaces/${workspaceId}/projects`,
  },
  TASKS: {
    LIST_BY_PROJECT: (projectId: string | number) => `/projects/${projectId}/tasks`,
    CREATE: (projectId: string | number) => `/projects/${projectId}/tasks`,
    DETAIL: (taskId: string | number) => `/tasks/${taskId}`,
    UPDATE: (taskId: string | number) => `/tasks/${taskId}`,
    REORDER: (taskId: string | number) => `/tasks/${taskId}/reorder`,
    DELETE: (taskId: string | number) => `/tasks/${taskId}`,
  },
  ITEMS: {
    LIST: '/items',
    CREATE: '/items',
    DETAIL: (id: string | number) => `/items/${id}`,
    UPDATE: (id: string | number) => `/items/${id}`,
    DELETE: (id: string | number) => `/items/${id}`,
  },
} as const;
