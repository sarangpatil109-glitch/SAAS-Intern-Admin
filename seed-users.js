const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const adminPassword = await bcrypt.hash('India@11', 10);
  await prisma.user.upsert({
    where: { email: 'sarangpati109@gmail.com' },
    update: {
      password: adminPassword,
      role: 'Admin',
      name: 'System Admin 1',
      phone: '0000000000',
      sales_id: 'ADMIN001',
      status: 'Active'
    },
    create: {
      sales_id: 'ADMIN001',
      name: 'System Admin 1',
      phone: '0000000000',
      email: 'sarangpati109@gmail.com',
      password: adminPassword,
      role: 'Admin',
      status: 'Active'
    }
  });

  await prisma.user.upsert({
    where: { email: 'psbhaukaal@gmail.com' },
    update: {
      password: adminPassword,
      role: 'Admin',
      name: 'System Admin 2',
      phone: '0000000000',
      sales_id: 'ADMIN002',
      status: 'Active'
    },
    create: {
      sales_id: 'ADMIN002',
      name: 'System Admin 2',
      phone: '0000000000',
      email: 'psbhaukaal@gmail.com',
      password: adminPassword,
      role: 'Admin',
      status: 'Active'
    }
  });

  const execPassword = await bcrypt.hash('exec123', 10);
  await prisma.user.upsert({
    where: { email: 'exec@saas.com' },
    update: {
      password: execPassword,
      role: 'Sales Executive'
    },
    create: {
      sales_id: 'EXEC001',
      name: 'John Sales',
      phone: '1111111111',
      email: 'exec@saas.com',
      password: execPassword,
      role: 'Sales Executive',
      status: 'Active'
    }
  });
  console.log('Seed completed: Admin and Exec');
}

main().finally(() => prisma.$disconnect());
