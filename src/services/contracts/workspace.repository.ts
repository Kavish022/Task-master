import { Workspace, Project, WorkspaceMemberItem } from '@/types/kanban';

export interface IWorkspaceRepository {
  listWorkspaces(): Promise<Workspace[]>;
  getWorkspace(workspaceId: number): Promise<Workspace>;
  getWorkspaceProjects(workspaceId: number): Promise<Project[]>;
  createWorkspace(data: { name: string; slug: string; description?: string }): Promise<Workspace>;
  createProject(workspaceId: number, data: { name: string; key: string; description?: string }): Promise<Project>;
  getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMemberItem[]>;
  inviteMember(workspaceId: number, data: { email: string; role: 'ADMIN' | 'MEMBER' }): Promise<void>;
}
