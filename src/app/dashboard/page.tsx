import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardFilter from './DashboardFilter';

export default async function DashboardPage(props: { searchParams: Promise<{ from?: string, to?: string }> }) {
  const session = await getSession();
  if (!session || !session.id) {
    redirect('/login');
  }

  const sales_executive_id = session.id as number;
  const searchParams = await props.searchParams;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let fromDate = todayStart;
  let toDate = todayEnd;
  let isDefault = true;

  if (searchParams.from && searchParams.to) {
    fromDate = new Date(searchParams.from);
    fromDate.setHours(0, 0, 0, 0);
    toDate = new Date(searchParams.to);
    toDate.setHours(23, 59, 59, 999);
    isDefault = false;
  }

  const dateFilter = {
    gte: fromDate,
    lte: toDate
  };

  const [todaysSales, pendingSales, approvedSales, rejectedSales, todaysCommissions, totalCommissions] = await Promise.all([
    prisma.sale.count({
      where: {
        sales_executive_id,
        created_at: dateFilter,
      },
    }),
    prisma.sale.count({
      where: { sales_executive_id, status: 'Pending', created_at: dateFilter },
    }),
    prisma.sale.count({
      where: { sales_executive_id, status: 'Approved', created_at: dateFilter },
    }),
    prisma.sale.count({
      where: { sales_executive_id, status: 'Rejected', created_at: dateFilter },
    }),
    prisma.commission.aggregate({
      where: {
        sales_executive_id,
        created_at: dateFilter
      },
      _sum: { commission_amount: true }
    }),
    prisma.commission.aggregate({
      where: { 
        sales_executive_id,
        created_at: dateFilter
      },
      _sum: { commission_amount: true }
    })
  ]);

  const statCards = [
    { name: isDefault ? "Today's Sales" : "Sales (Period)", value: todaysSales, color: "from-blue-500 to-cyan-400" },
    { name: "Pending Sales", value: pendingSales, color: "from-amber-500 to-orange-400" },
    { name: "Approved Sales", value: approvedSales, color: "from-emerald-500 to-teal-400" },
    { name: "Rejected Sales", value: rejectedSales, color: "from-red-500 to-rose-400" },
    { name: isDefault ? "Today's Commission" : "Commission (Period)", value: `₹${todaysCommissions._sum.commission_amount || 0}`, color: "from-purple-500 to-pink-400" },
    { name: "Total Commission", value: `₹${totalCommissions._sum.commission_amount || 0}`, color: "from-fuchsia-500 to-rose-400" },
  ];

  const dateDisplay = isDefault 
    ? "Today" 
    : `${fromDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${toDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
          Dashboard
        </h2>
        <p className="text-slate-400 text-sm mt-1">Overview of your sales performance.</p>
      </div>

      <DashboardFilter 
        initialFrom={searchParams.from || ''} 
        initialTo={searchParams.to || ''} 
      />

      <div className="mb-4">
        <span className="text-sm font-medium text-slate-400">Showing Data For </span>
        <span className="text-sm font-bold text-white px-2 py-1 bg-slate-800 rounded-lg ml-2">{dateDisplay}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-colors"
          >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.color}`}></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-400 mb-1">{stat.name}</span>
              <span className="text-4xl font-bold text-white">{stat.value}</span>
            </div>
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
