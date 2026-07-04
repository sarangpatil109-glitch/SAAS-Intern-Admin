import prisma from '@/lib/prisma';
import CommissionEditForm from './CommissionEditForm';

export default async function AdminCommissionSettingsPage() {
  const settings = await prisma.commissionSetting.findMany({
    include: { product: true },
    orderBy: { product: { name: 'asc' } }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">Commission Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage commission amounts for different products.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Product Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Commission Amount (₹)</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {settings.map((setting) => (
                <tr key={setting.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{setting.product.name}</div>
                  </td>
                  <CommissionEditForm setting={setting} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
