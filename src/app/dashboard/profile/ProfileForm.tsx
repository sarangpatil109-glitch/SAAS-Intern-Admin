'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const file = formData.get('payment_qr_image') as File;
    if (file && file.size === 0) {
      formData.delete('payment_qr_image');
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccess('Profile updated successfully');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-teal-500/10 border border-teal-500 text-teal-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Sales ID (Read Only)</label>
            <input
              type="text"
              defaultValue={user.sales_id}
              disabled
              className="w-full px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              defaultValue={user.name}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Mobile Number</label>
            <input
              type="tel"
              name="phone"
              defaultValue={user.phone}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">UPI ID</label>
            <input
              type="text"
              name="upi_id"
              defaultValue={user.upi_id || ''}
              placeholder="example@upi"
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Bank Account Holder Name</label>
            <input
              type="text"
              name="account_holder_name"
              defaultValue={user.account_holder_name || ''}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Bank Name</label>
            <input
              type="text"
              name="bank_name"
              defaultValue={user.bank_name || ''}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Account Number</label>
            <input
              type="text"
              name="account_number"
              defaultValue={user.account_number || ''}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">IFSC Code</label>
            <input
              type="text"
              name="ifsc_code"
              defaultValue={user.ifsc_code || ''}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50 uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">GPay / Payment QR Upload (JPG/PNG)</label>
            <input
              type="file"
              name="payment_qr_image"
              accept="image/jpeg, image/png, image/jpg"
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
            />
            {user.payment_qr_image && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Current QR Code:</p>
                <img src={user.payment_qr_image} alt="QR Code Preview" className="h-32 object-contain rounded-lg border border-slate-800" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
