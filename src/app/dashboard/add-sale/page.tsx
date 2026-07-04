import prisma from '@/lib/prisma';
import AddSaleForm from './AddSaleForm';

export default async function AddSalePage() {
  const activeProducts = await prisma.product.findMany({
    where: { status: 'Active' },
    orderBy: { name: 'asc' }
  });

  return <AddSaleForm activeProducts={activeProducts} />;
}
