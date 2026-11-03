export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface WorkspaceMemberUser {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface WorkspaceMemberItem {
  id: number;
  workspaceId: number;
  userId: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  membershipStatus: string;
  joinedAt?: string;
  user: WorkspaceMemberUser;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  description?: string;
  role?: string;
  members?: WorkspaceMemberItem[];
  _count?: {
    projects: number;
    members: number;
  };
}

export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  key: string;
  description?: string;
  status: string;
}

export interface TaskLabel {
  id: number;
  name: string;
  color: string;
}

export interface TaskItem {
  id: number;
  projectId: number;
  taskKey: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  version?: number;
  assigneeId?: number | null;
  creatorId?: number;
  assignee?: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  labels?: Array<{
    label: TaskLabel;
  }>;
  _count?: {
    subtasks?: number;
    comments?: number;
    attachments?: number;
  };
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  isEdited: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface TaskHistoryItem {
  id: number;
  taskId: number;
  changedBy: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user?: {
    name: string;
  };
}

export type DependencyType = 'BLOCKS' | 'BLOCKED_BY' | 'RELATES_TO';

export interface TaskDependencyItem {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  type: DependencyType;
  createdAt: string;
  dependsOnTask?: {
    id: number;
    taskKey: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
  };
  task?: {
    id: number;
    taskKey: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
  };
}

export interface TaskDetail extends TaskItem {
  version: number;
  comments?: TaskComment[];
  history?: TaskHistoryItem[];
  subtasks?: TaskItem[];
  dependencies?: TaskDependencyItem[];
  dependentOn?: TaskDependencyItem[];
}

export interface ReorderTaskPayload {
  targetStatus?: TaskStatus;
  previousPosition?: number | null;
  nextPosition?: number | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  dueDate?: string | null;
  version: number;
}
