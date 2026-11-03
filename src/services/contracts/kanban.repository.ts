import {
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

export interface IKanbanRepository {
  listTasks(projectId: number, search?: string, status?: TaskStatus): Promise<TaskItem[]>;
  getTask(taskId: number): Promise<TaskDetail>;
  createTask(projectId: number, data: { title: string; description?: string; priority?: string }): Promise<TaskItem>;
  updateTask(taskId: number, payload: UpdateTaskPayload): Promise<TaskItem>;
  updateTaskStatus(taskId: number, status: TaskStatus, version?: number): Promise<TaskItem>;
  reorderTask(taskId: number, payload: ReorderTaskPayload): Promise<TaskItem>;
  deleteTask(taskId: number): Promise<void>;

  // Subtasks & Dependencies
  createSubtask(
    parentTaskId: number,
    data: { title: string; priority?: TaskPriority; assigneeId?: number }
  ): Promise<TaskItem>;
  toggleTask(taskId: number, completed?: boolean): Promise<TaskItem>;
  addDependency(
    taskId: number,
    dependsOnTaskId: number,
    type?: DependencyType
  ): Promise<TaskDependencyItem>;
  removeDependency(dependencyId: number): Promise<void>;

  // Comments
  listComments(taskId: number): Promise<TaskComment[]>;
  addComment(taskId: number, content: string): Promise<TaskComment>;
  deleteComment(commentId: number): Promise<void>;
}
