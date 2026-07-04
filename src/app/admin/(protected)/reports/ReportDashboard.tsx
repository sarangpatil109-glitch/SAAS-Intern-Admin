'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

export default function ReportDashboard({ initialSales, execStats, products, executives }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterProduct, setFilterProduct] = useState('All');
  const [filterExec, setFilterExec] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isExporting, setIsExporting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Global calculations for cards
  const globalStats = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0, todays = 0, totalCommission = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    initialSales.forEach((s: any) => {
      if (s.status === 'Pending') pending++;
      else if (s.status === 'Approved') approved++;
      else if (s.status === 'Rejected') rejected++;

      if (new Date(s.created_at) >= today) todays++;
      if (s.commission) totalCommission += s.commission.commission_amount;
    });

    return { total: initialSales.length, pending, approved, rejected, todays, totalCommission };
  }, [initialSales]);

  // Filtered sales logic
  const filteredSales = useMemo(() => {
    return initialSales.filter((sale: any) => {
      let match = true;
      if (filterStatus !== 'All' && sale.status !== filterStatus) match = false;
      if (filterProduct !== 'All' && sale.product.name !== filterProduct) match = false;
      if (filterExec !== 'All' && sale.sales_executive.name !== filterExec) match = false;
      
      if (startDate && new Date(sale.created_at) < new Date(startDate)) match = false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(sale.created_at) > end) match = false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          sale.customer_name.toLowerCase().includes(term) ||
          sale.customer_phone.includes(term) ||
          sale.customer_email.toLowerCase().includes(term) ||
          sale.sales_executive.name.toLowerCase().includes(term) ||
          sale.sales_executive.sales_id.toLowerCase().includes(term);
        
        if (!matchesSearch) match = false;
      }

      return match;
    });
  }, [initialSales, filterStatus, filterProduct, filterExec, startDate, endDate, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true);
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    setTimeout(() => setIsSearching(false), 300); // simulate loading indicator
  };

  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = filteredSales.map((s: any) => ({
        'Submission Date': new Date(s.created_at).toLocaleString(),
        'Sales ID': s.sales_executive.sales_id,
        'Sales Executive': s.sales_executive.name,
        'Customer Name': s.customer_name,
        'Customer Phone': s.customer_phone,
        'Customer Email': s.customer_email,
        'Product': s.product.name,
        'Status': s.status,
        'Commission': s.status === 'Approved' && s.commission ? s.commission.commission_amount : 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
      
      // Simulate slight delay for loading indicator visibility
      await new Promise(r => setTimeout(r, 500));
      XLSX.writeFile(workbook, `Sales_Report_${new Date().getTime()}.xlsx`);
    } catch (err) {
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/10 text-emerald-400">Approved</span>;
      case 'Pending': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-500/10 text-amber-400">Pending</span>;
      case 'Rejected': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/10 text-red-400">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Sales</p>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-cyan-400">{globalStats.total}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Today's Sales</p>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-cyan-400">{globalStats.todays}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Pending Sales</p>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-400">{globalStats.pending}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Approved Sales</p>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-400">{globalStats.approved}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Rejected Sales</p>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-rose-400">{globalStats.rejected}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Commission Generated</p>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-500 to-pink-400">₹{globalStats.totalCommission}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Executives (Active / Blocked)</p>
          <p className="text-2xl font-extrabold text-white mt-1">
            {execStats.total} <span className="text-lg text-slate-500 font-normal">({execStats.active} / {execStats.blocked})</span>
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by Customer (Name, Phone, Email), Exec Name, or Sales ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
            {isSearching && <span className="absolute right-4 top-2.5 text-slate-500 text-sm">Searching...</span>}
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredSales.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-colors disabled:opacity-50 shadow-lg"
          >
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
            <select
              value={filterProduct}
              onChange={(e) => handleFilterChange(setFilterProduct, e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="All">All Products</option>
              {products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-slate-500 mb-1">Sales Executive</label>
            <select
              value={filterExec}
              onChange={(e) => handleFilterChange(setFilterExec, e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="All">All Executives</option>
              {executives.map((e: any) => <option key={e.id} value={e.name}>{e.name} ({e.sales_id})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Submission Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Sales ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Executive</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {currentSales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-400 font-medium">
                    {sale.sales_executive.sales_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {sale.sales_executive.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{sale.customer_name}</div>
                    <div className="text-xs text-slate-500">{sale.customer_phone}</div>
                    <div className="text-xs text-slate-500">{sale.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {sale.product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sale.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-400">
                    ₹{sale.status === 'Approved' && sale.commission ? sale.commission.commission_amount : 0}
                  </td>
                </tr>
              ))}
              {currentSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                      <p className="text-lg">No records found matching your filters.</p>
                      <p className="text-sm">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} entries
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
