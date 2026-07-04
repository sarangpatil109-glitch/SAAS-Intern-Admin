const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('India@11', 10);

  const adminEmail = 'sarangpati109@gmail.com';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      sales_id: 'ADMIN001',
      name: 'Sarang',
      phone: '9999999999',
      password: hashedPassword,
      role: 'Admin',
      status: 'Active'
    },
    create: {
      sales_id: 'ADMIN001',
      name: 'Sarang',
      phone: '9999999999',
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin',
      status: 'Active'
    }
  });

  console.log('Admin account upserted: ' + adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
