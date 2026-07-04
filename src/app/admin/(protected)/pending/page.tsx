import prisma from '@/lib/prisma';
import PendingSalesList from './PendingSalesList';

export default async function AdminPendingSalesPage() {
  const pendingSales = await prisma.sale.findMany({
    where: { status: 'Pending' },
    orderBy: { created_at: 'desc' },
    include: {
      sales_executive: {
        select: {
          name: true,
          sales_id: true,
        },
      },
      product: {
        select: {
          name: true
        }
      }
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">Pending Sales</h2>
        <p className="text-slate-400 text-sm mt-1">Review and approve or reject pending sales.</p>
      </div>

      <PendingSalesList sales={pendingSales} />
    </div>
  );
}
