const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  await prisma.commissionSetting.upsert({ 
    where: { product_name: 'Gym Software' }, 
    update: {}, 
    create: { product_name: 'Gym Software', commission_amount: 100 } 
  }); 
  console.log('Commission setting created'); 
} 

main().finally(() => prisma.$disconnect());
