const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'sarangpati109@gmail.com';
  
  // Find all admins
  const admins = await prisma.user.findMany({
    where: { role: 'Admin' }
  });

  if (admins.length > 1) {
    console.log(`Found ${admins.length} Admin accounts. Cleaning up...`);
    
    // Find the one with correct email if it exists
    let primaryAdmin = admins.find(a => a.email === adminEmail);
    
    // If not found, just keep the first one
    if (!primaryAdmin) {
      primaryAdmin = admins[0];
    }

    const duplicateIds = admins
      .filter(a => a.id !== primaryAdmin.id)
      .map(a => a.id);

    if (duplicateIds.length > 0) {
      // First, delete related records if they exist to avoid foreign key constraints (though admins shouldn't have sales typically)
      await prisma.commission.deleteMany({
        where: { sales_executive_id: { in: duplicateIds } }
      });
      await prisma.sale.deleteMany({
        where: { sales_executive_id: { in: duplicateIds } }
      });

      // Delete the duplicate users
      const deleted = await prisma.user.deleteMany({
        where: { id: { in: duplicateIds } }
      });
      
      console.log(`Deleted ${deleted.count} duplicate Admin accounts.`);
    }
  } else {
    console.log('No duplicate Admin accounts found.');
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
