import prisma from '@/lib/prisma';
import ProductList from './ProductList';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: { sales: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">Product Management</h2>
        <p className="text-slate-400 text-sm mt-1">Manage all dynamically available products.</p>
      </div>

      <ProductList initialProducts={products} />
    </div>
  );
}
