import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HistoryList from './HistoryList';

export default async function SalesHistoryPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'Sales Executive') {
    redirect('/login');
  }

  const sales = await prisma.sale.findMany({
    where: { sales_executive_id: session.id as number },
    include: {
      product: true,
      commission: true
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">Sales History</h2>
        <p className="text-slate-400 text-sm mt-1">View all your submitted sales and their current status.</p>
      </div>

      <HistoryList sales={sales} />
    </div>
  );
}
