import { PrismaClient, Project, Task, TaskStatus, TaskPriority } from '@prisma/client';
import { SeededUsers } from './users.seed';

export interface SeededTasks {
  task1: Task;
  task2: Task;
  task3: Task;
  task4: Task;
  task5: Task;
}

export async function seedTasks(
  prisma: PrismaClient,
  project: Project,
  users: SeededUsers,
  labels: Record<string, number>
): Promise<SeededTasks> {
  const task1 = await prisma.task.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      projectId: project.id,
      taskKey: 'ENG-1',
      title: 'Implement JWT Refresh Token Rotation with Revocation',
      description: 'Store token family in SQL table, invalidate compromised tokens on replay detection.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      position: 10000.0,
      estimatedMinutes: 240,
      actualMinutes: 120,
      assigneeId: users.sarah.id,
      creatorId: users.alex.id,
      labels: {
        create: [{ labelId: labels['backend'] }, { labelId: labels['feature'] }],
      },
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      projectId: project.id,
      taskKey: 'ENG-2',
      title: 'Design Composite Indexes for (projectId, status, position)',
      description: 'Optimize Kanban column retrieval and eliminate file-sort on large task datasets.',
      status: TaskStatus.DONE,
      priority: TaskPriority.URGENT,
      position: 20000.0,
      estimatedMinutes: 120,
      actualMinutes: 90,
      assigneeId: users.alex.id,
      creatorId: users.alex.id,
      completedAt: new Date(),
      labels: {
        create: [{ labelId: labels['backend'] }, { labelId: labels['performance'] }],
      },
    },
  });

  const task3 = await prisma.task.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      projectId: project.id,
      taskKey: 'ENG-3',
      title: 'Build Optimistic Drag-and-Drop Kanban Board in React',
      description: 'Smooth drag animations, midpoint fractional calculation, and rollback on network failure.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      position: 30000.0,
      estimatedMinutes: 300,
      assigneeId: users.sarah.id,
      creatorId: users.alex.id,
      labels: {
        create: [{ labelId: labels['frontend'] }, { labelId: labels['feature'] }],
      },
    },
  });

  const task4 = await prisma.task.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      projectId: project.id,
      taskKey: 'ENG-4',
      title: 'Multi-Tenant Workspace Invitation Flow & Email Notifications',
      description: 'Generate secure invitation tokens, send transactional notifications, and handle acceptance.',
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      position: 40000.0,
      estimatedMinutes: 180,
      creatorId: users.alex.id,
      labels: {
        create: [{ labelId: labels['backend'] }],
      },
    },
  });

  const task5 = await prisma.task.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      projectId: project.id,
      parentTaskId: task1.id,
      taskKey: 'ENG-5',
      title: 'Add database migration for revoked flag on refresh_tokens',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      position: 10000.0,
      creatorId: users.alex.id,
      assigneeId: users.sarah.id,
    },
  });

  console.log('  📋 Tasks & subtasks seeded (ENG-1 to ENG-5)');
  return { task1, task2, task3, task4, task5 };
}
