import React from 'react';
import { Phone, MessageCircle, Users, FileText, ChevronRight, X } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';

// ── Activity type definitions ─────────────────────────────────────────────────
const ACTIVITY_TYPES = [
  { label: 'Phone Call', icon: <Phone size={18} />,        color: COLORS.anccent_green },
  { label: 'Message',    icon: <MessageCircle size={18} />, color: COLORS.anccent_green },
  { label: 'Meeting',    icon: <Users size={18} />,         color: COLORS.warning },
  { label: 'Note',       icon: <FileText size={18} />,      color: COLORS.warning },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  /** Optional: called when a type is selected, passes the activity label */
  onSelectType?: (type: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const AddActivityModal: React.FC<Props> = ({ onClose, onSelectType }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

    {/* Popup */}
    <div
      className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
        <span className="text-[18px] font-semibold text-slate-800">Add Activity</span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Type list */}
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
            <span className="flex-1 text-[15px] font-medium text-slate-800">{t.label}</span>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  </div>
);
