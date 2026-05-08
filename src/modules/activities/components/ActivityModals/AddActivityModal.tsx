import React from 'react';
import { Phone, MessageCircle, Users, FileText, ChevronRight, X } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';

const ACTIVITY_TYPES = [
  { label: 'Phone Call', icon: <Phone size={18} />,        color: COLORS.anccent_green },
  { label: 'Message',    icon: <MessageCircle size={18} />, color: COLORS.anccent_green },
  { label: 'Meeting',    icon: <Users size={18} />,         color: COLORS.warning },
  { label: 'Note',       icon: <FileText size={18} />,      color: COLORS.warning },
] as const;

interface Props {
  onClose: () => void;
  onSelectType?: (type: string) => void;
}

export const AddActivityModal: React.FC<Props> = ({ onClose, onSelectType }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    <div
      className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
        <Text weight="semibold" className="text-slate-800" style={{ fontSize: '18px' }}>Add Activity</Text>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="py-2">
        {ACTIVITY_TYPES.map((t, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
            onClick={() => {
              onSelectType?.(t.label);
              onClose();
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${t.color}18`, color: t.color }}
            >
              {t.icon}
            </div>
            <Text weight="medium" className="flex-1 text-slate-800" style={{ fontSize: '15px' }}>{t.label}</Text>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  </div>
);
