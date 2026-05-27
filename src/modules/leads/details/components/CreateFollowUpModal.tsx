/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { X, Clock, CalendarDays, Loader2, Phone, MessageCircle, Mail } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import { createFollowup } from '@/modules/follow-up/api/followUpApi';
import { api } from '@/core/api/axios'; 
import { API_ENDPOINTS } from '@/core/api/api';

interface Props {
  leadId: string;
  assignedUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_OPTIONS = [
  { type: 'CALL', label: 'Call', icon: <Phone size={18} /> },
  { type: 'TEXT', label: 'Text', icon: <MessageCircle size={18} /> },
  { type: 'MAIL', label: 'Mail', icon: <Mail size={18} /> },
  { type: 'WHATSAPP', label: 'WhatsApp', icon: <MessageCircle size={18} /> },
];

export const CreateFollowUpModal: React.FC<Props> = ({ leadId, assignedUserId, onClose, onSuccess }) => {
  const [selectedType, setSelectedType] = useState('CALL');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; notes?: string; general?: string }>({});

  const validate = () => {
    const nextErrors: { date?: string; notes?: string } = {};

    if (!dateStr) {
      nextErrors.date = 'Please select a date';
    } else {
      const followUpDate = timeStr
        ? new Date(`${dateStr}T${timeStr}:00`)
        : new Date(`${dateStr}T00:00:00`);

      if (Number.isNaN(followUpDate.getTime())) {
        nextErrors.date = 'Please select a valid date';
      } else if (followUpDate < new Date()) {
        nextErrors.date = 'Follow-up date cannot be in the past';
      }
    }

    if (!notes.trim()) {
      nextErrors.notes = 'Please enter notes';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const formattedDate = timeStr
        ? new Date(`${dateStr}T${timeStr}:00`).toISOString()
        : new Date(`${dateStr}T00:00:00`).toISOString();
      
      const payload = {
        leadId,
        userId: assignedUserId, 
        notes: notes.trim(),
        date: formattedDate,
        type: selectedType,
      };

      const result = await createFollowup(payload);

      if (result.status === 'success') {
        
        try {
          await api.post(API_ENDPOINTS.LEADS.UPDATE_STATUS, { leadId, status: 'Follow Up' });
        } catch (e) {
          console.error("Failed to update status to Follow Up", e);
        }
        onSuccess();
      } else {
        setErrors({ general: result.message || 'Failed to create follow-up' });
      }
    } catch (err: any) {
      setErrors({ general: err?.response?.data?.message || 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
          <Text weight="semibold" className="text-slate-800" style={{ fontSize: '18px' }}>New Follow-Up</Text>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 overflow-y-auto">
          {/* Type Selector */}
          <div className="flex flex-col gap-3">
            <Text weight="semibold" className="text-slate-500 tracking-wide uppercase" style={{ fontSize: '12px' }}>Follow-Up Via</Text>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
                    style={{
                      borderColor: isSelected ? COLORS.primary : '#E2E8F0',
                      backgroundColor: isSelected ? `${COLORS.primary}0D` : 'transparent'
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? COLORS.primary : '#F1F5F9',
                        color: isSelected ? 'white' : '#64748B',
                      }}
                    >
                      {opt.icon}
                    </div>
                    <Text weight="medium" style={{ fontSize: '13px', color: isSelected ? COLORS.primary : '#475569' }}>
                      {opt.label}
                    </Text>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div className="flex flex-col gap-3">
            <Text weight="semibold" className="text-slate-500 tracking-wide uppercase" style={{ fontSize: '12px' }}>Schedule</Text>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all min-w-0">
                <CalendarDays size={18} className="text-slate-400" />
                <input
                  type="date"
                  className="flex-1 bg-transparent text-[15px] outline-none text-slate-800"
                  value={dateStr}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => {
                    setDateStr(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all min-w-0">
                <Clock size={18} className="text-slate-400" />
                <input
                  type="time"
                  className="flex-1 bg-transparent text-[15px] outline-none text-slate-800"
                  value={timeStr}
                  onChange={e => setTimeStr(e.target.value)}
                />
              </div>
            </div>
            {errors.date && (
              <Text style={{ color: COLORS.danger, fontSize: '12px' }}>{errors.date}</Text>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-3">
            <Text weight="semibold" className="text-slate-500 tracking-wide uppercase" style={{ fontSize: '12px' }}>Notes</Text>
            <textarea
              className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
              placeholder="Add notes for the follow-up...
• Important points to discuss
• Questions to ask
• Next steps"
              value={notes}
              onChange={e => {
                setNotes(e.target.value);
                if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }));
              }}
            />
            {errors.notes && (
              <Text style={{ color: COLORS.danger, fontSize: '12px' }}>{errors.notes}</Text>
            )}
            <Text style={{ color: '#64748B', fontSize: '12px' }}>These notes will help you prepare for the follow-up</Text>
          </div>

          {errors.general && (
            <div className="px-2 bg-red-50 py-2 rounded-lg border border-red-100">
              <Text className="text-red-500" style={{ fontSize: '14px' }}>{errors.general}</Text>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            disabled={isLoading}
          >
            <Text weight="semibold">Cancel</Text>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white transition-colors flex items-center justify-center min-w-[160px]"
            style={{ backgroundColor: COLORS.primary }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Text weight="semibold">Schedule Follow-Up</Text>}
          </button>
        </div>
      </div>
    </div>
  );
};
