import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ApprovalButtons from './ApprovalButtons';
import Image from 'next/image';

export default async function AdminSaleDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const saleId = parseInt(params.id, 10);
  if (isNaN(saleId)) notFound();

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      sales_executive: {
        select: {
          name: true,
          sales_id: true,
        },
      },
      product: true,
      commission: true,
    },
  });

  if (!sale) notFound();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>;
      case 'Rejected':
        return <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rejected</span>;
      default:
        return <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Sale Details</h2>
          <p className="text-slate-400 text-sm mt-1">Review the submission details below.</p>
        </div>
        <div>
          {getStatusBadge(sale.status)}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-teal-400 mb-4 border-b border-slate-800 pb-2">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm text-slate-500">Name</span>
                  <span className="font-medium text-slate-200">{sale.customer_name}</span>
                </div>
                <div>
                  <span className="block text-sm text-slate-500">Phone</span>
                  <span className="font-medium text-slate-200">{sale.customer_phone}</span>
                </div>
                <div>
                  <span className="block text-sm text-slate-500">Email</span>
                  <span className="font-medium text-slate-200">{sale.customer_email}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-teal-400 mb-4 border-b border-slate-800 pb-2">Sale Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm text-slate-500">Product</span>
                  <span className="font-medium text-slate-200">{sale.product.name}</span>
                </div>
                <div>
                  <span className="block text-sm text-slate-500">Remarks</span>
                  <span className="font-medium text-slate-200 whitespace-pre-wrap">{sale.remarks || 'No remarks provided.'}</span>
                </div>
                <div>
                  <span className="block text-sm text-slate-500">Commission Amount</span>
                  <span className="font-medium text-teal-400">
                    ₹{sale.status === 'Approved' && sale.commission ? sale.commission.commission_amount : 0}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-slate-500">Submission Date</span>
                  <span className="font-medium text-slate-200">{new Date(sale.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-teal-400 mb-4 border-b border-slate-800 pb-2">Sales Executive</h3>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm text-slate-500">Name</span>
                  <span className="font-medium text-slate-200">{sale.sales_executive.name}</span>
                </div>
                <div>
                  <span className="block text-sm text-slate-500">Sales ID</span>
                  <span className="font-medium text-slate-200">{sale.sales_executive.sales_id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-teal-400 mb-4 border-b border-slate-800 pb-2">Payment Screenshot</h3>
            <div className="relative w-full aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group cursor-pointer">
              <a href={sale.payment_screenshot} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                <img
                  src={sale.payment_screenshot}
                  alt="Payment Screenshot"
                  className="object-contain w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium bg-black/60 px-4 py-2 rounded-lg">Click to Enlarge</span>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>

      <ApprovalButtons saleId={sale.id} currentStatus={sale.status} />

    </div>
  );
}
