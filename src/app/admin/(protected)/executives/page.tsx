import prisma from '@/lib/prisma';
import ExecutiveList from './ExecutiveList';

export default async function AdminExecutivesPage() {
  const executives = await prisma.user.findMany({
    where: { role: 'Sales Executive' },
    include: {
      sales: {
        select: { status: true }
      },
      commissions: {
        select: { commission_amount: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  const formattedExecs = executives.map(exec => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    
    exec.sales.forEach(sale => {
      if (sale.status === 'Pending') pending++;
      else if (sale.status === 'Approved') approved++;
      else if (sale.status === 'Rejected') rejected++;
    });

    const totalCommission = exec.commissions.reduce((sum, c) => sum + c.commission_amount, 0);

    return {
      id: exec.id,
      sales_id: exec.sales_id,
      name: exec.name,
      phone: exec.phone,
      email: exec.email,
      status: exec.status,
      created_at: exec.created_at,
      total_sales: exec.sales.length,
      approved,
      pending,
      rejected,
      total_commission: totalCommission
    };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">Sales Executives</h2>
        <p className="text-slate-400 text-sm mt-1">Manage all registered Sales Executives and monitor their performance.</p>
      </div>

      <ExecutiveList initialExecutives={formattedExecs} />
    </div>
  );
}
