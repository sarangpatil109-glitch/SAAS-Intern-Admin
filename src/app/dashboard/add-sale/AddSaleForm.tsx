'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddSaleForm({ activeProducts }: { activeProducts: any[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    product_id: activeProducts.length > 0 ? activeProducts[0].id.toString() : '',
    remarks: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Payment screenshot is required');
      return;
    }
    if (!formData.product_id) {
      setError('Please select a product');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      data.append('payment_screenshot', file);

      const res = await fetch('/api/sales', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit sale');

      setSuccess('Sale submitted successfully and is now Pending!');
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        product_id: activeProducts.length > 0 ? activeProducts[0].id.toString() : '',
        remarks: ''
      });
      setFile(null);
      const fileInput = document.getElementById('payment_screenshot') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => router.push('/dashboard/history'), 2000);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-2xl font-bold text-white">Add New Sale</h2>
          <p className="text-slate-400 text-sm mt-1">Submit a new sale for approval</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Customer Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Customer Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="customer_phone"
                  required
                  pattern="^\+?[\d\s\-()]+$"
                  title="Valid phone number formatting required"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Customer Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="customer_email"
                  required
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  placeholder="customer@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Product <span className="text-red-500">*</span></label>
                <select
                  name="product_id"
                  required
                  value={formData.product_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none"
                >
                  {activeProducts.length === 0 ? (
                    <option value="">No products available</option>
                  ) : (
                    activeProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Payment Screenshot (Image) <span className="text-red-500">*</span></label>
              <input
                type="file"
                id="payment_screenshot"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Remarks (Optional)</label>
              <textarea
                name="remarks"
                rows={3}
                value={formData.remarks}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="Any additional notes..."
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || activeProducts.length === 0}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold tracking-wide hover:from-cyan-400 hover:to-indigo-400 focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(6,182,212,0.2)] disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Sale'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
