import {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  MembershipStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../../config/db';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from './workspace.validation';

export type WorkspaceWithOwner = Prisma.WorkspaceGetPayload<{
  include: {
    owner: {
      select: { id: true; name: true; email: true; avatarUrl: true };
    };
  };
}>;

export type WorkspaceMemberWithUser = Prisma.WorkspaceMemberGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        avatarUrl: true;
        accountStatus: true;
      };
    };
  };
}>;

export type UserWorkspaceSummary = Prisma.WorkspaceGetPayload<{
  include: {
    members: {
      select: { role: true; joinedAt: true };
    };
    _count: {
      select: { projects: true; members: true };
    };
  };
}>;

export class WorkspaceRepository {
  static async createWithDefaults(
    userId: number,
    input: CreateWorkspaceInput
  ): Promise<Workspace> {
    return prisma.$transaction(async (tx) => {
      // 1. Create Workspace
      const workspace = await tx.workspace.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          timezone: input.timezone || 'UTC',
          ownerId: userId,
        },
      });

      // 2. Add creator as OWNER
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: WorkspaceRole.OWNER,
          membershipStatus: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      // 3. Create starter labels
      const defaultLabels = [
        { name: 'bug', color: '#EF4444' },
        { name: 'feature', color: '#3B82F6' },
        { name: 'performance', color: '#10B981' },
        { name: 'documentation', color: '#F59E0B' },
      ];

      await tx.label.createMany({
        data: defaultLabels.map((l) => ({
          workspaceId: workspace.id,
          name: l.name,
          color: l.color,
        })),
      });

      // 4. Log audit activity
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          userId,
          action: 'WORKSPACE_CREATED',
          metadata: { name: workspace.name, slug: workspace.slug },
        },
      });

      return workspace;
    });
  }

  static async findById(id: number): Promise<WorkspaceWithOwner | null> {
    return prisma.workspace.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  static async findBySlug(slug: string): Promise<WorkspaceWithOwner | null> {
    return prisma.workspace.findFirst({
      where: { slug, deletedAt: null },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  static async findUserWorkspaces(userId: number): Promise<UserWorkspaceSummary[]> {
    return prisma.workspace.findMany({
      where: {
        deletedAt: null,
        members: {
          some: {
            userId,
            membershipStatus: MembershipStatus.ACTIVE,
          },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true, joinedAt: true },
        },
        _count: {
          select: { projects: true, members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findMembers(workspaceId: number): Promise<WorkspaceMemberWithUser[]> {
    return prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        membershipStatus: MembershipStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            accountStatus: true,
          },
        },
      },
      orderBy: { role: 'asc' },
    });
  }

  static async findMember(
    workspaceId: number,
    userId: number
  ): Promise<WorkspaceMember | null> {
    return prisma.workspaceMember.findUnique({
      where: {
        uq_workspace_member: {
          workspaceId,
          userId,
        },
      },
    });
  }

  static async addMember(
    workspaceId: number,
    userId: number,
    role: WorkspaceRole,
    invitedBy: number
  ): Promise<WorkspaceMember> {
    return prisma.workspaceMember.upsert({
      where: {
        uq_workspace_member: {
          workspaceId,
          userId,
        },
      },
      update: {
        role,
        membershipStatus: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
      create: {
        workspaceId,
        userId,
        role,
        membershipStatus: MembershipStatus.ACTIVE,
        invitedBy,
        joinedAt: new Date(),
      },
    });
  }

  static async updateMemberRole(
    workspaceId: number,
    userId: number,
    role: WorkspaceRole
  ): Promise<WorkspaceMember> {
    return prisma.workspaceMember.update({
      where: {
        uq_workspace_member: {
          workspaceId,
          userId,
        },
      },
      data: { role },
    });
  }

  static async removeMember(
    workspaceId: number,
    userId: number
  ): Promise<WorkspaceMember> {
    return prisma.workspaceMember.update({
      where: {
        uq_workspace_member: {
          workspaceId,
          userId,
        },
      },
      data: { membershipStatus: MembershipStatus.REMOVED },
    });
  }

  static async update(
    id: number,
    input: UpdateWorkspaceInput
  ): Promise<Workspace> {
    const updateData: Prisma.WorkspaceUpdateInput = {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.timezone ? { timezone: input.timezone } : {}),
      ...(input.settings ? { settings: input.settings as Prisma.InputJsonValue } : {}),
    };

    return prisma.workspace.update({
      where: { id },
      data: updateData,
    });
  }

  static async softDelete(id: number): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
