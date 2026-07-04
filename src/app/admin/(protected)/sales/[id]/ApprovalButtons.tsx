'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApprovalButtons({ saleId, currentStatus }: { saleId: number, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (status: string) => {
    if (currentStatus === status) return; // Prevent duplicate

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/sales/${saleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus !== 'Pending') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <p className="text-slate-400">This sale has already been <span className="font-bold text-white">{currentStatus}</span>.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">Approval Actions</h3>
      
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => handleUpdate('Approved')}
          disabled={loading}
          className="flex-1 py-3 px-6 rounded-xl font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Approve Sale'}
        </button>

        <button
          onClick={() => handleUpdate('Rejected')}
          disabled={loading}
          className="flex-1 py-3 px-6 rounded-xl font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Reject Sale'}
        </button>
      </div>
    </div>
  );
}
