/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Pencil, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Text } from '@/core/components/ui/Text';
import { COLORS } from '@/core/components/theme/colors';
import { CreateFollowUpModal } from './CreateFollowUpModal';

export const LeadFollowUpCard: React.FC<{ followups: Record<string, unknown>[], leadId?: string, assignedUserId?: string, onRefresh?: () => void }> = ({ followups, leadId, assignedUserId, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="bg-[#F8F7F3] rounded-[32px] p-6 shadow-sm border border-black/5 flex flex-col relative h-fit">   
       <div className="flex items-center justify-between mb-8">
      <Text size="xl" weight="semibold" className="text-black">Follow Up</Text>
      <button 
        onClick={() => setShowCreateModal(true)}
        className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 hover:opacity-90 " style={{ backgroundColor: COLORS.primary }}>
        <Pencil className="w-5 h-5" />
      </button>
    </div>

      {followups && followups.length > 0 ? (
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {followups.map((fu: any, idx) => {
            const fuDate = fu.date ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(fu.date)) : '';
            const fuTime = fu.time || '';
            const isCompleted = fu.status?.toLowerCase() === 'completed';

            return (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <Text size="base" weight="semibold" className={isCompleted ? 'text-gray-500 line-through' : 'text-slate-800'}>
                    {fu.title || 'Follow Up'}
                  </Text>
                  {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>

                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <Text size="custom" weight="medium" className="text-[12px]">{fuDate}</Text>
                  </div>
                  {fuTime && (
                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      <Text size="custom" weight="medium" className="text-[12px]">{fuTime as string}</Text>
                    </div>
                  )}
                </div>

                {fu.description && typeof fu.description === 'string' && (
                  <Text size="sm" className="text-slate-600 mt-2 line-clamp-2">
                    {fu.description as string}
                  </Text>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 opacity-70 mt-12 pb-12">
          <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-full">
            <Clock className="w-8 h-8 text-slate-400 stroke-[1.5]" />
          </div>
          <Text size="lg" weight="medium" className="text-slate-500">No Follow Up</Text>
        </div>
      )}

      {showCreateModal && leadId && assignedUserId && (
        <CreateFollowUpModal
          leadId={leadId}
          assignedUserId={assignedUserId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
};
