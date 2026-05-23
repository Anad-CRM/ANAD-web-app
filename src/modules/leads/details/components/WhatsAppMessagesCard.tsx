import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Text } from '@/core/components/ui/Text';
import { WhatsAppMessage } from '@/modules/leads/api/leadsApi';
import { Whatsapp } from '@thesvg/react';
interface Props {
  messages: WhatsAppMessage[];
  leadId: string;
}

export const WhatsAppMessagesCard: React.FC<Props> = ({ messages }) => {
  if (messages.length === 0) return null;
  // Show only latest 3 messages
  const displayMessages = messages.slice(0, 3);
  const hasMore = messages.length > 3;

  return (
    <div className="bg-[#F8F7F3] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-black/5 flex flex-col relative h-fit">
      <div className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center">
            <Whatsapp width={18} height={18} className="text-[#4CAF50]" />
          </div>
          <Text weight="bold" className="text-slate-800" style={{ fontSize: '16px' }}>
            WhatsApp Messages
          </Text>
        </div>
        <div className="bg-[#4CAF50]/10 px-2.5 py-0.5 rounded-full">
          <Text weight="bold" className="text-[#4CAF50]" style={{ fontSize: '12px' }}>
            {messages.length}
          </Text>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {displayMessages.map((msg, i) => (
          <div key={i} className="bg-[#F8F9FA] rounded-2xl p-3 sm:p-4 border border-slate-100/50">
            <Text className="text-slate-700 leading-relaxed break-words" style={{ fontSize: '13.5px' }}>
              {msg.text}
            </Text>
            <div className="flex items-center gap-1.5 mt-2.5 opacity-60">
              <Clock size={12} className="text-slate-500" />
              <Text style={{ fontSize: '11px' }} className="text-slate-500">
                {msg.date} • {msg.time}
              </Text>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button className="w-full mt-4 py-3 bg-slate-50 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors group">
          <Text weight="semibold" className="text-slate-500 group-hover:text-slate-800 transition-colors" style={{ fontSize: '13px' }}>
            View all {messages.length} messages
          </Text>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>
      )}
    </div>
  );
};
