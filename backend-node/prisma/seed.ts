import { PrismaClient } from '@prisma/client';
import { runAllSeeds } from './seeds';

const prisma = new PrismaClient();

async function main() {
  await runAllSeeds(prisma);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
