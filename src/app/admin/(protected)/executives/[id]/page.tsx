import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ExecutiveProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const execId = parseInt(params.id, 10);
  
  if (isNaN(execId)) notFound();

  const executive = await prisma.user.findUnique({
    where: { id: execId },
    include: {
      sales: {
        include: { product: true, commission: true },
        orderBy: { created_at: 'desc' }
      },
      commissions: true
    }
  });

  if (!executive || executive.role !== 'Sales Executive') notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let todaysSales = 0;
  
  executive.sales.forEach(sale => {
    if (sale.status === 'Pending') pending++;
    else if (sale.status === 'Approved') approved++;
    else if (sale.status === 'Rejected') rejected++;

    if (new Date(sale.created_at) >= today) {
      todaysSales++;
    }
  });

  const totalCommission = executive.commissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const todaysCommission = executive.commissions
    .filter(c => new Date(c.created_at) >= today)
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/10 text-emerald-400">Approved</span>;
      case 'Pending': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-500/10 text-amber-400">Pending</span>;
      case 'Rejected': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/10 text-red-400">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Executive Profile</h2>
          <p className="text-slate-400 text-sm mt-1">Detailed performance and sales history.</p>
        </div>
        <Link href="/admin/executives" className="text-indigo-400 hover:text-indigo-300 font-medium">
          &larr; Back to List
        </Link>
      </div>

      {/* Profile Details & Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-1 space-y-4">
          <div className="flex items-center space-x-4 mb-6 border-b border-slate-800 pb-4">
            <div className="h-16 w-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-bold uppercase">
              {executive.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{executive.name}</h3>
              <p className="text-indigo-400 text-sm">{executive.sales_id}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">Mobile Number</span>
              <span className="text-slate-300 font-medium">{executive.phone}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">Email Address</span>
              <span className="text-slate-300 font-medium">{executive.email}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">Status</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${
                executive.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {executive.status}
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">Registration Date</span>
              <span className="text-slate-300 font-medium">{new Date(executive.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Payment Information</h4>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">UPI ID</span>
              <span className="text-slate-300 font-medium">{executive.upi_id || 'Not provided'}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">Account Holder</span>
              <span className="text-slate-300 font-medium">{executive.account_holder_name || 'Not provided'}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">Bank Name</span>
              <span className="text-slate-300 font-medium">{executive.bank_name || 'Not provided'}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">Account Number</span>
              <span className="text-slate-300 font-medium">{executive.account_number || 'Not provided'}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 uppercase tracking-wider">IFSC Code</span>
              <span className="text-slate-300 font-medium">{executive.ifsc_code || 'Not provided'}</span>
            </div>
            {executive.payment_qr_image && (
              <div className="pt-2">
                <span className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Payment QR</span>
                <img src={executive.payment_qr_image} alt="QR Code" className="h-32 object-contain rounded-lg border border-slate-800" />
              </div>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Total Sales</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-indigo-400">
              {executive.sales.length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Today's Sales</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-cyan-400">
              {todaysSales}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Pending Sales</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-400">
              {pending}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Approved Sales</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-400">
              {approved}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Rejected Sales</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-rose-400">
              {rejected}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Total Commission</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-500 to-rose-400">
              ₹{totalCommission}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sm:col-span-2 lg:col-span-3">
            <p className="text-slate-400 text-sm font-medium mb-1">Today's Commission</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-pink-400">
              ₹{todaysCommission}
            </p>
          </div>
        </div>
      </div>

      {/* Sales History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">Sales History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {executive.sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{sale.customer_name}</div>
                    <div className="text-xs text-slate-500">{sale.customer_phone}</div>
                    <div className="text-xs text-slate-500">{sale.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {sale.product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sale.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-400">
                    ₹{sale.status === 'Approved' && sale.commission ? sale.commission.commission_amount : 0}
                  </td>
                </tr>
              ))}
              {executive.sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No sales history found for this executive.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
