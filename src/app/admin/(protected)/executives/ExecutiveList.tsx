'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ExecutiveList({ initialExecutives }: { initialExecutives: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const toggleStatus = async (id: number, currentStatus: string) => {
    if (!confirm(`Are you sure you want to ${currentStatus === 'Active' ? 'block' : 'unblock'} this executive?`)) return;
    
    setLoadingId(id);
    try {
      const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
      const res = await fetch(`/api/admin/executives/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      } else {
        router.refresh();
      }
    } catch (e) {
      alert('An error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const filteredExecs = initialExecutives.filter(exec => {
    // Filter
    if (filter !== 'All' && exec.status !== filter) return false;
    
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        exec.sales_id.toLowerCase().includes(term) ||
        exec.name.toLowerCase().includes(term) ||
        exec.phone.includes(term) ||
        exec.email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredExecs.length / itemsPerPage);
  const currentExecs = filteredExecs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by Sales ID, Name, Phone, or Email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500/50 appearance-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Executive</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Sales (T/A/P/R)</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Total Commission</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Created Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {currentExecs.map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{exec.name}</div>
                    <div className="text-xs text-indigo-400">{exec.sales_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-300">{exec.phone}</div>
                    <div className="text-xs text-slate-500">{exec.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      exec.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {exec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <div className="flex space-x-2">
                      <span className="text-white font-bold" title="Total">{exec.total_sales}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-emerald-400" title="Approved">{exec.approved}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-amber-400" title="Pending">{exec.pending}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-red-400" title="Rejected">{exec.rejected}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-400">
                    ₹{exec.total_commission}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(exec.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3 items-center">
                    <Link href={`/admin/executives/${exec.id}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      View
                    </Link>
                    <button 
                      onClick={() => toggleStatus(exec.id, exec.status)}
                      disabled={loadingId === exec.id}
                      className={`${exec.status === 'Active' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'} transition-colors disabled:opacity-50`}
                    >
                      {loadingId === exec.id ? '...' : exec.status === 'Active' ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
              {currentExecs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No executives found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredExecs.length)} of {filteredExecs.length} entries
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
