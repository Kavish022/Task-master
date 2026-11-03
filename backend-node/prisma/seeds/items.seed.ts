import { PrismaClient, ItemStatus, ItemPriority } from '@prisma/client';

export async function seedItems(prisma: PrismaClient, userId: number): Promise<void> {
  const count = await prisma.item.count();
  if (count > 0) {
    console.log('   ⏭ Items already exist, skipping...');
    return;
  }

  const items = [
    {
      title: 'Design Hexagonal Architecture Diagram',
      description: 'Create an exhaustive C4 and Ports-and-Adapters diagram for the engineering team.',
      status: ItemStatus.completed,
      priority: ItemPriority.high,
      userId,
    },
    {
      title: 'Implement JWT Refresh Rotation Interceptor',
      description: 'Ensure Axios response interceptor handles 401 with sliding refresh tokens.',
      status: ItemStatus.completed,
      priority: ItemPriority.high,
      userId,
    },
    {
      title: 'Configure Optimistic Concurrency Control',
      description: 'Implement version checks on task updates to prevent lost updates in multi-tenant boards.',
      status: ItemStatus.in_progress,
      priority: ItemPriority.medium,
      userId,
    },
    {
      title: 'Setup Automated Vitest Unit & Integration Suites',
      description: 'Write unit tests for state stores, repositories, and custom hook wrappers.',
      status: ItemStatus.in_progress,
      priority: ItemPriority.medium,
      userId,
    },
    {
      title: 'Build Dark Mode Glassmorphic Linear UI',
      description: 'Refine Tailwind styling, custom scrollbars, and animated loader spinner transitions.',
      status: ItemStatus.draft,
      priority: ItemPriority.low,
      userId,
    },
    {
      title: 'Implement WebSocket Real-Time Task Sync',
      description: 'Add Socket.io or native WebSockets for multi-user card drag-and-drop live sync.',
      status: ItemStatus.draft,
      priority: ItemPriority.low,
      userId,
    },
  ];

  await prisma.item.createMany({
    data: items,
  });

  console.log(`   ✔ Seeded ${items.length} items`);
}

