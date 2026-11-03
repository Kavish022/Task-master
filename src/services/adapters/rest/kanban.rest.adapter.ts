import { apiClient } from '@/lib/axios';
import { ENDPOINTS } from '@/config/endpoints';
import type { IKanbanRepository } from '@/services/contracts/kanban.repository';
import type {
  TaskItem,
  TaskDetail,
  TaskComment,
  ReorderTaskPayload,
  UpdateTaskPayload,
  TaskStatus,
  TaskPriority,
  DependencyType,
  TaskDependencyItem,
} from '@/types/kanban';

export class KanbanRestAdapter implements IKanbanRepository {
  async listTasks(projectId: number, search?: string, status?: TaskStatus): Promise<TaskItem[]> {
    const params: Record<string, string> = { groupBy: 'none' };
    if (search) params.search = search;
    if (status) params.status = status;

    const response = await apiClient.get<{ data: TaskItem[] | Record<string, TaskItem[]> }>(
      ENDPOINTS.TASKS.LIST_BY_PROJECT(projectId),
      { params }
    );
    const data = response.data.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      return Object.values(data).flat();
    }
    return [];
  }

  async getTask(taskId: number): Promise<TaskDetail> {
    const response = await apiClient.get<{ data: TaskDetail }>(
      ENDPOINTS.TASKS.DETAIL(taskId)
    );
    return response.data.data;
  }

  async createTask(
    projectId: number,
    data: { title: string; description?: string; priority?: string }
  ): Promise<TaskItem> {
    const response = await apiClient.post<{ data: TaskItem }>(
      ENDPOINTS.TASKS.CREATE(projectId),
      data
    );
    return response.data.data;
  }

  async updateTask(taskId: number, payload: UpdateTaskPayload): Promise<TaskItem> {
    const response = await apiClient.patch<{ data: TaskItem }>(
      ENDPOINTS.TASKS.UPDATE(taskId),
      payload
    );
    return response.data.data;
  }

  async updateTaskStatus(taskId: number, status: TaskStatus, version = 1): Promise<TaskItem> {
    const response = await apiClient.patch<{ data: TaskItem }>(
      ENDPOINTS.TASKS.UPDATE(taskId),
      { status, version }
    );
    return response.data.data;
  }

  async reorderTask(taskId: number, payload: ReorderTaskPayload): Promise<TaskItem> {
    const response = await apiClient.patch<{ data: TaskItem }>(
      ENDPOINTS.TASKS.REORDER(taskId),
      payload
    );
    return response.data.data;
  }

  async deleteTask(taskId: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.TASKS.DELETE(taskId));
  }

  async createSubtask(
    parentTaskId: number,
    data: { title: string; priority?: TaskPriority; assigneeId?: number }
  ): Promise<TaskItem> {
    const response = await apiClient.post<{ data: TaskItem }>(
      `/tasks/${parentTaskId}/subtasks`,
      data
    );
    return response.data.data;
  }

  async toggleTask(taskId: number, completed?: boolean): Promise<TaskItem> {
    const response = await apiClient.patch<{ data: TaskItem }>(
      `/tasks/${taskId}/toggle`,
      completed !== undefined ? { completed } : {}
    );
    return response.data.data;
  }

  async addDependency(
    taskId: number,
    dependsOnTaskId: number,
    type: DependencyType = 'BLOCKED_BY'
  ): Promise<TaskDependencyItem> {
    const response = await apiClient.post<{ data: TaskDependencyItem }>(
      `/tasks/${taskId}/dependencies`,
      { dependsOnTaskId, type }
    );
    return response.data.data;
  }

  async removeDependency(dependencyId: number): Promise<void> {
    await apiClient.delete(`/tasks/dependencies/${dependencyId}`);
  }

  async listComments(taskId: number): Promise<TaskComment[]> {
    const response = await apiClient.get<{ data: TaskComment[] }>(
      `/tasks/${taskId}/comments`
    );
    return response.data.data;
  }

  async addComment(taskId: number, content: string): Promise<TaskComment> {
    const response = await apiClient.post<{ data: TaskComment }>(
      `/tasks/${taskId}/comments`,
      { content }
    );
    return response.data.data;
  }

  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  }
}
