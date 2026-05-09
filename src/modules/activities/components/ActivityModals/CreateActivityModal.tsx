import React, { useState } from 'react';
import { X, Clock, Loader2 } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { activityService } from '../../services/activityService';
import { getUser } from '@/core/utils/auth';
import { Text } from '@/core/components/ui/Text';

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

      await activityService.createActivity(leadId, {
        title: activityType,
        description: description.trim(),
        userId,
      });

      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Something went wrong');
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
          <Text weight="semibold" className="text-slate-800" style={{ fontSize: '18px' }}>Add {activityType}</Text>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Text weight="semibold" className="text-slate-600 tracking-wide uppercase" style={{ fontSize: '13px' }}>Details</Text>
            <textarea
              className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
              placeholder="Add activity details here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && <Text className="text-red-500 mt-1 px-1" style={{ fontSize: '14px' }}>{error}</Text>}
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
            <Clock size={18} className="text-slate-400" />
            <Text weight="semibold" className="text-slate-800" style={{ fontSize: '15px' }}>Today</Text>
            <Text weight="medium" className="text-slate-600" style={{ fontSize: '15px' }}>{timeStr}</Text>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            disabled={isLoading}
          >
            <Text weight="semibold">Cancel</Text>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-white transition-colors flex items-center justify-center min-w-[120px]"
            style={{ backgroundColor: COLORS.primary }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Text weight="semibold">Add Activity</Text>}
          </button>
        </div>
      </div>
    </div>
  );
};
