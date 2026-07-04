const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log(`Email: ${u.email}, Exact Role: '${u.role}'`);
  }
}
main().finally(() => prisma.$disconnect());
