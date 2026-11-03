import { PrismaClient, Task } from '@prisma/client';
import { SeededUsers } from './users.seed';

export async function seedCommentsAndHistory(
  prisma: PrismaClient,
  task: Task,
  users: SeededUsers
): Promise<void> {
  // 1. Seed Discussion Comment
  await prisma.comment.create({
    data: {
      taskId: task.id,
      userId: users.alex.id,
      content: 'Make sure to check if the old refresh token was already revoked before generating the new pair!',
    },
  });

  // 2. Seed Audit Trail (Task History)
  await prisma.taskHistory.create({
    data: {
      taskId: task.id,
      changedBy: users.sarah.id,
      fieldName: 'status',
      oldValue: 'TODO',
      newValue: 'IN_PROGRESS',
    },
  });

  console.log('  💬 Comments & audit history seeded');
}
