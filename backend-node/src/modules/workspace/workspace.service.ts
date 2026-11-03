import { WorkspaceRole } from '@prisma/client';
import { WorkspaceRepository } from './workspace.repository';
import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
} from './workspace.validation';
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../utils/apiError';
import { prisma } from '../../config/db';

export class WorkspaceService {
  static async createWorkspace(userId: number, input: CreateWorkspaceInput) {
    const existing = await WorkspaceRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictError(`Workspace slug "${input.slug}" is already taken`);
    }

    return WorkspaceRepository.createWithDefaults(userId, input);
  }

  static async getUserWorkspaces(userId: number) {
    return WorkspaceRepository.findUserWorkspaces(userId);
  }

  static async getWorkspaceById(workspaceId: number) {
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }
    return workspace;
  }

  static async getWorkspaceBySlug(slug: string) {
    const workspace = await WorkspaceRepository.findBySlug(slug);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }
    return workspace;
  }

  static async getMembers(workspaceId: number) {
    return WorkspaceRepository.findMembers(workspaceId);
  }

  static async inviteMember(
    workspaceId: number,
    inviterId: number,
    input: InviteMemberInput
  ) {
    // 1. Check if user exists
    const userToInvite = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!userToInvite) {
      throw new NotFoundError(`User with email "${input.email}" not found`);
    }

    // 2. Check if already a member
    const existingMember = await WorkspaceRepository.findMember(workspaceId, userToInvite.id);
    if (existingMember && existingMember.membershipStatus === 'ACTIVE') {
      throw new ConflictError('User is already an active member of this workspace');
    }

    // 3. Add or reactivate member
    const member = await WorkspaceRepository.addMember(
      workspaceId,
      userToInvite.id,
      input.role,
      inviterId
    );

    // 4. Create in-app notification
    await prisma.notification.create({
      data: {
        userId: userToInvite.id,
        eventType: 'WORKSPACE_INVITE',
        payload: {
          workspaceId,
          invitedBy: inviterId,
          role: input.role,
        },
      },
    });

    return member;
  }

  static async updateMemberRole(
    workspaceId: number,
    targetUserId: number,
    input: UpdateMemberRoleInput
  ) {
    const member = await WorkspaceRepository.findMember(workspaceId, targetUserId);
    if (!member) {
      throw new NotFoundError('Workspace member not found');
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new BadRequestError('Cannot change the role of the workspace owner. Transfer ownership instead.');
    }

    return WorkspaceRepository.updateMemberRole(workspaceId, targetUserId, input.role);
  }

  static async removeMember(workspaceId: number, targetUserId: number) {
    const member = await WorkspaceRepository.findMember(workspaceId, targetUserId);
    if (!member) {
      throw new NotFoundError('Workspace member not found');
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ForbiddenError('Workspace owner cannot be removed');
    }

    return WorkspaceRepository.removeMember(workspaceId, targetUserId);
  }

  static async updateWorkspace(workspaceId: number, input: UpdateWorkspaceInput) {
    return WorkspaceRepository.update(workspaceId, input);
  }

  static async deleteWorkspace(workspaceId: number) {
    return WorkspaceRepository.softDelete(workspaceId);
  }
}
