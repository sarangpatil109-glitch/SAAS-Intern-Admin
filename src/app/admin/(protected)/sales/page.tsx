import prisma from '@/lib/prisma';
import Link from 'next/link';
import SalesFilters from './SalesFilters';
import AllSalesList from './AllSalesList';

export default async function AdminAllSalesPage(props: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || '';
  const statusFilter = searchParams.status && searchParams.status !== 'All' ? searchParams.status : undefined;

  const sales = await prisma.sale.findMany({
    where: {
      status: statusFilter,
      OR: q ? [
        { customer_name: { contains: q } },
        { customer_phone: { contains: q } },
        { customer_email: { contains: q } },
        { sales_executive: { name: { contains: q } } },
        { sales_executive: { sales_id: { contains: q } } },
      ] : undefined,
    },
    orderBy: { created_at: 'desc' },
    include: {
      sales_executive: {
        select: {
          name: true,
          sales_id: true,
        },
      },
      product: {
        select: { name: true }
      }
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>;
      case 'Rejected':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rejected</span>;
      default:
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">All Sales</h2>
          <p className="text-slate-400 text-sm mt-1">View and search through all sales records.</p>
        </div>
        <SalesFilters currentQuery={q} currentStatus={searchParams.status || 'All'} />
      </div>

      <AllSalesList sales={sales} />
    </div>
  );
}
