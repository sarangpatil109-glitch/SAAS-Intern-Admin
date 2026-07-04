'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SalesFilters({ currentQuery, currentStatus }: { currentQuery: string, currentStatus: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    updateParams(query, status);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(query, currentStatus);
  };

  const updateParams = (q: string, status: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status && status !== 'All') params.set('status', status);
    
    router.push(`/admin/sales?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <form onSubmit={handleSearch} className="flex-1 sm:w-64">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email, ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </form>
      
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        className="py-2 pl-4 pr-8 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all appearance-none"
      >
        <option value="All">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>
  );
}
