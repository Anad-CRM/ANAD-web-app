import React, { useState } from 'react';
import { X, Clock, Loader2 } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { leadsApi } from '@/modules/leads/api/leadsApi';
import { getUser } from '@/core/utils/auth';

interface Props {
  leadId: string;
  activityType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateActivityModal: React.FC<Props> = ({ leadId, activityType, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please add activity details');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData = getUser<Record<string, string>>();
      const userId = userData?.id || '';

      await leadsApi.createActivity(leadId, {
        title: activityType,
        description: description.trim(),
        userId,
      });

      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();
  const timeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(now);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <span className="text-[18px] font-semibold text-slate-800">Add {activityType}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-slate-600 tracking-wide uppercase">Details</label>
            <textarea
              className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
              placeholder="Add activity details here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && <span className="text-red-500 text-sm mt-1 px-1">{error}</span>}
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
            <Clock size={18} className="text-slate-400" />
            <span className="text-[15px] font-semibold text-slate-800">Today</span>
            <span className="text-[15px] font-medium text-slate-600">{timeStr}</span>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-semibold text-white transition-colors flex items-center justify-center min-w-[120px]"
            style={{ backgroundColor: COLORS.primary }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Add Activity'}
          </button>
        </div>
      </div>
    </div>
  );
};
