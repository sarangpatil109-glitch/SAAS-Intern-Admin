import prisma from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalSales, todaysSales, pendingSales, approvedSales, rejectedSales, totalCommission] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.count({
      where: {
        created_at: {
          gte: today,
        },
      },
    }),
    prisma.sale.count({
      where: { status: 'Pending' },
    }),
    prisma.sale.count({
      where: { status: 'Approved' },
    }),
    prisma.sale.count({
      where: { status: 'Rejected' },
    }),
    prisma.commission.aggregate({
      _sum: { commission_amount: true }
    })
  ]);

  const statCards = [
    { name: "Total Sales", value: totalSales, color: "from-purple-500 to-indigo-400" },
    { name: "Today's Sales", value: todaysSales, color: "from-blue-500 to-cyan-400" },
    { name: "Pending Sales", value: pendingSales, color: "from-amber-500 to-orange-400" },
    { name: "Approved Sales", value: approvedSales, color: "from-emerald-500 to-teal-400" },
    { name: "Rejected Sales", value: rejectedSales, color: "from-red-500 to-rose-400" },
    { name: "Total Commission", value: `₹${totalCommission._sum.commission_amount || 0}`, color: "from-fuchsia-500 to-rose-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
          Admin Dashboard
        </h2>
        <p className="text-slate-400 text-sm mt-1">Overview of all system sales performance.</p>
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
