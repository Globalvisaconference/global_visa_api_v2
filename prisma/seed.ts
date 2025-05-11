import { PrismaClient } from '@prisma/client';
import { seedConferences } from '../seed-conferences';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.conference.createMany({
      data: seedConferences,
      skipDuplicates: true,
    });
  } catch (error) {
    throw error;
  }
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
