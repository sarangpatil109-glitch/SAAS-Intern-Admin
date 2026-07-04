const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.upsert({
    where: { name: 'Gym Software' },
    update: { status: 'Active' },
    create: {
      name: 'Gym Software',
      status: 'Active'
    }
  });

  await prisma.commissionSetting.upsert({
    where: { product_id: product.id },
    update: { commission_amount: 100 },
    create: {
      product_id: product.id,
      commission_amount: 100
    }
  });

  console.log('Seed completed: Product & Commission Setting');
}

main().finally(() => prisma.$disconnect());
