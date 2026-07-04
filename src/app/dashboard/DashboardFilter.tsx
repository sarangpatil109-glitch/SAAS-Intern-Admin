'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardFilter({ initialFrom, initialTo }: { initialFrom: string, initialTo: string }) {
  const router = useRouter();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [error, setError] = useState('');

  const handleApply = () => {
    setError('');
    if (!from || !to) {
      setError('Both From and To dates are required to apply filter.');
      return;
    }
    if (new Date(from) > new Date(to)) {
      setError('From Date cannot be greater than To Date.');
      return;
    }
    router.push(`/dashboard?from=${from}&to=${to}`);
  };

  const handleReset = () => {
    setFrom('');
    setTo('');
    setError('');
    router.push('/dashboard');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div className="flex sm:flex-none gap-2 mt-2 sm:mt-0">
          <button
            onClick={handleApply}
            className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-colors shadow-lg"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none px-6 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
