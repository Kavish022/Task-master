import { PrismaClient, Workspace, WorkspaceRole, MembershipStatus } from '@prisma/client';
import { SeededUsers } from './users.seed';

export interface SeededWorkspaceData {
  workspace: Workspace;
  labels: Record<string, number>;
}

export async function seedWorkspaces(
  prisma: PrismaClient,
  users: SeededUsers
): Promise<SeededWorkspaceData> {
  // 1. Seed Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-engineering' },
    update: {},
    create: {
      name: 'Acme Engineering',
      slug: 'acme-engineering',
      description: 'Core product engineering and infrastructure teams.',
      ownerId: users.alex.id,
      timezone: 'UTC',
      settings: {
        allowPublicProjects: false,
        defaultTaskPriority: 'MEDIUM',
      },
    },
  });

  // 2. Seed Memberships
  await prisma.workspaceMember.upsert({
    where: {
      uq_workspace_member: {
        workspaceId: workspace.id,
        userId: users.alex.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: users.alex.id,
      role: WorkspaceRole.OWNER,
      membershipStatus: MembershipStatus.ACTIVE,
      joinedAt: new Date(),
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      uq_workspace_member: {
        workspaceId: workspace.id,
        userId: users.sarah.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: users.sarah.id,
      role: WorkspaceRole.ADMIN,
      membershipStatus: MembershipStatus.ACTIVE,
      invitedBy: users.alex.id,
      joinedAt: new Date(),
    },
  });

  // 3. Seed Labels
  const labelsData = [
    { name: 'backend', color: '#8B5CF6' },
    { name: 'frontend', color: '#EC4899' },
    { name: 'bug', color: '#EF4444' },
    { name: 'feature', color: '#3B82F6' },
    { name: 'performance', color: '#10B981' },
  ];

  const labels: Record<string, number> = {};
  for (const l of labelsData) {
    const label = await prisma.label.upsert({
      where: {
        uq_workspace_label_name: {
          workspaceId: workspace.id,
          name: l.name,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        name: l.name,
        color: l.color,
      },
    });
    labels[l.name] = label.id;
  }

  console.log(`  🏢 Workspace & members seeded: ${workspace.name} (Alex: OWNER, Sarah: ADMIN)`);
  console.log(`  🏷️  Labels seeded: ${Object.keys(labels).join(', ')}`);

  return { workspace, labels };
}
