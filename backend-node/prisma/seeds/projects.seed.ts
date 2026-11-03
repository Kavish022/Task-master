import { PrismaClient, Project, ProjectStatus } from '@prisma/client';
import { SeededWorkspaceData } from './workspaces.seed';

export async function seedProjects(
  prisma: PrismaClient,
  workspaceData: SeededWorkspaceData
): Promise<Project> {
  const project = await prisma.project.upsert({
    where: {
      uq_workspace_project_key: {
        workspaceId: workspaceData.workspace.id,
        key: 'ENG',
      },
    },
    update: {},
    create: {
      workspaceId: workspaceData.workspace.id,
      name: 'NextGen Cloud Platform',
      key: 'ENG',
      description: 'Distributed microservices architecture and high-throughput API gateway.',
      status: ProjectStatus.ACTIVE,
      startDate: new Date(),
    },
  });

  console.log(`  📁 Project seeded: ${project.name} [${project.key}]`);
  return project;
}
