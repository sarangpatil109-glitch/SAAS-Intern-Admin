import prisma from '@/lib/prisma';
import ReportDashboard from './ReportDashboard';

export default async function AdminReportsPage() {
  const [sales, executives, products, execList] = await Promise.all([
    prisma.sale.findMany({
      include: {
        sales_executive: { select: { name: true, sales_id: true } },
        product: { select: { name: true } },
        commission: { select: { commission_amount: true } }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.user.findMany({
      where: { role: 'Sales Executive' },
      select: { status: true }
    }),
    prisma.product.findMany({
      where: { status: 'Active' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.user.findMany({
      where: { role: 'Sales Executive' },
      select: { id: true, name: true, sales_id: true },
      orderBy: { name: 'asc' }
    })
  ]);

  const execStats = {
    total: executives.length,
    active: executives.filter(e => e.status === 'Active').length,
    blocked: executives.filter(e => e.status === 'Blocked').length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">Reports & Analytics</h2>
        <p className="text-slate-400 text-sm mt-1">Comprehensive system reports, statistics, and data export.</p>
      </div>

      <ReportDashboard 
        initialSales={sales} 
        execStats={execStats} 
        products={products}
        executives={execList}
      />
    </div>
  );
}
