import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';
import { seedWorkspaces } from './workspaces.seed';
import { seedProjects } from './projects.seed';
import { seedTasks } from './tasks.seed';
import { seedCommentsAndHistory } from './comments.seed';
import { seedItems } from './items.seed';

export async function runAllSeeds(prisma: PrismaClient): Promise<void> {
  const startTime = Date.now();
  console.log('🌱 Starting modular database seeding...\n');

  // Step 1: Users (Foundation)
  console.log('▶ [1/6] Seeding Users...');
  const users = await seedUsers(prisma);

  // Step 2: Workspaces & Members (Multi-tenancy)
  console.log('\n▶ [2/6] Seeding Workspaces, Members & Labels...');
  const workspaceData = await seedWorkspaces(prisma, users);

  // Step 3: Projects
  console.log('\n▶ [3/6] Seeding Projects...');
  const project = await seedProjects(prisma, workspaceData);

  // Step 4: Tasks & Subtasks
  console.log('\n▶ [4/6] Seeding Tasks & Subtasks...');
  const tasks = await seedTasks(prisma, project, users, workspaceData.labels);

  // Step 5: Comments & Audit Trails
  console.log('\n▶ [5/6] Seeding Comments & Audit Trails...');
  await seedCommentsAndHistory(prisma, tasks.task1, users);

  // Step 6: Generic Items (Catalog & Dashboard Metrics)
  console.log('\n▶ [6/6] Seeding Items...');
  await seedItems(prisma, users.alex.id);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ All seeds completed successfully in ${duration}s!`);
}
