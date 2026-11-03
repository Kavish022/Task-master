import { PrismaClient, UserAccountStatus, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface SeededUsers {
  alex: User;
  sarah: User;
}

export async function seedUsers(prisma: PrismaClient): Promise<SeededUsers> {
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const alex = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      email: 'alex@example.com',
      name: 'Alex Morgan',
      passwordHash,
      accountStatus: UserAccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      name: 'Sarah Chen',
      passwordHash,
      accountStatus: UserAccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('  👤 Users seeded: Alex Morgan & Sarah Chen');
  return { alex, sarah };
}
