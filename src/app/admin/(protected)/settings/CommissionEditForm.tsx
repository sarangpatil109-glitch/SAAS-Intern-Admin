'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommissionEditForm({ setting }: { setting: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(setting.commission_amount);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/settings/commission/${setting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission_amount: parseFloat(amount) }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      alert('Error updating commission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
            min="0"
            step="1"
          />
        ) : (
          <div className="text-sm text-slate-300">₹{setting.commission_amount}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setIsEditing(false); setAmount(setting.commission_amount); }}
              disabled={loading}
              className="text-slate-400 hover:text-slate-300 font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-1.5 border border-slate-600 text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Edit
          </button>
        )}
      </td>
    </>
  );
}
