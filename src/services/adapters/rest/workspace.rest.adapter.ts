import { apiClient } from '@/lib/axios';
import { ENDPOINTS } from '@/config/endpoints';
import type { IWorkspaceRepository } from '@/services/contracts/workspace.repository';
import type { Workspace, Project, WorkspaceMemberItem } from '@/types/kanban';

export class WorkspaceRestAdapter implements IWorkspaceRepository {
  async listWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get<{ data: Workspace[] }>(ENDPOINTS.WORKSPACES.LIST);
    return response.data.data;
  }

  async getWorkspace(workspaceId: number): Promise<Workspace> {
    const response = await apiClient.get<{ data: Workspace }>(
      ENDPOINTS.WORKSPACES.DETAIL(workspaceId)
    );
    return response.data.data;
  }

  async getWorkspaceProjects(workspaceId: number): Promise<Project[]> {
    const response = await apiClient.get<{ data: Project[] }>(
      ENDPOINTS.WORKSPACES.PROJECTS(workspaceId)
    );
    return response.data.data;
  }

  async createWorkspace(data: { name: string; slug: string; description?: string }): Promise<Workspace> {
    const response = await apiClient.post<{ data: Workspace }>(
      ENDPOINTS.WORKSPACES.CREATE,
      data
    );
    return response.data.data;
  }

  async createProject(
    workspaceId: number,
    data: { name: string; key: string; description?: string }
  ): Promise<Project> {
    const response = await apiClient.post<{ data: Project }>(
      ENDPOINTS.WORKSPACES.CREATE_PROJECT(workspaceId),
      data
    );
    return response.data.data;
  }

  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMemberItem[]> {
    const response = await apiClient.get<{ data: WorkspaceMemberItem[] }>(
      `${ENDPOINTS.WORKSPACES.DETAIL(workspaceId)}/members`
    );
    return response.data.data;
  }

  async inviteMember(
    workspaceId: number,
    data: { email: string; role: 'ADMIN' | 'MEMBER' }
  ): Promise<void> {
    await apiClient.post(
      `${ENDPOINTS.WORKSPACES.DETAIL(workspaceId)}/members`,
      data
    );
  }
}
