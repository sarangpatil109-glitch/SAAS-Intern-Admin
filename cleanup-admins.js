const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'Admin' }
  });

  console.log(`Found ${admins.length} admins.`);

  for (const admin of admins) {
    if (admin.sales_id !== 'ADMIN001') {
      console.log(`Deleting extra admin: ${admin.email}`);
      await prisma.user.delete({ where: { id: admin.id } });
    } else {
      if (admin.email !== 'sarangpati109@gmail.com') {
         console.log(`Updating ADMIN001 email to sarangpati109@gmail.com`);
         await prisma.user.update({
           where: { id: admin.id },
           data: { email: 'sarangpati109@gmail.com' }
         });
      }
    }
  }

  console.log('Cleanup finished.');
}

main().finally(() => prisma.$disconnect());
