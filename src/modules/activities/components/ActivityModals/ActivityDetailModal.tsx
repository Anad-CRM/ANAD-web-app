import React from 'react';
import { Clock, FileText, MapPin, Edit3 } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import { Activity } from '../../types/activity.types';
import { SmallAvatar } from '../ActivityCards';

const fmtFull = (rawDate: string): string => {
  const dt = new Date(rawDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(dt);
};

const DetailSection: React.FC<{
  icon: React.ReactNode;
  color: string;
  label: string;
  children: React.ReactNode;
}> = ({ icon, color, label, children }) => (
  <div className="mb-2.5">
    <div className="flex items-center gap-1.5 mb-1.5">
      <span style={{ color }}>{icon}</span>
      <Text weight="semibold" className="tracking-wide" style={{ color, fontSize: '11px' }}>{label}</Text>
    </div>
    {children}
  </div>
);

interface Props {
  activity: Activity;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<Props> = ({ activity, onClose }) => {
  const rawDate      = activity.created_at ?? activity.createdAt ?? new Date().toISOString();
  const fullStr      = fmtFull(rawDate);
  const cur          = activity.status ?? activity.title ?? 'Activity';
  const prev         = activity.previous_status;
  const desc         = activity.description ?? activity.notes;
  const user         = activity.user ?? activity.staff;
  const assigned     = activity.assignedUser;
  const type         = activity.type;

  let displayTitle: string;
  if (type != null)             displayTitle = activity.title ?? type;
  else if (prev && prev.trim()) displayTitle = `${prev} → ${cur}`;
  else                          displayTitle = cur;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2" style={{ scrollbarWidth: 'thin' }}>
          <Text weight="bold" className="text-slate-800" style={{ fontSize: '20px' }}>{displayTitle}</Text>

          <div className="flex items-center gap-1.5 mt-2">
            <Clock size={14} className="text-slate-400" />
            <Text className="text-slate-500" style={{ fontSize: '14px' }}>{fullStr}</Text>
          </div>

          <div className="h-px bg-slate-100 my-5" />

          {desc && (
            <DetailSection icon={<FileText size={13} />} color={COLORS.warning} label="Note">
              <div
                className="w-full p-4 rounded-xl"
                style={{
                  backgroundColor: 'rgba(239,246,255,0.7)',
                  border: '1px solid rgba(2,132,199,0.2)',
                }}
              >
                <Text className="leading-relaxed" style={{ color: `${COLORS.primary}E6`, fontSize: '14.5px' }}>{desc}</Text>
              </div>
            </DetailSection>
          )}

          {assigned && (
            <DetailSection icon={<MapPin size={13} />} color={COLORS.primaryDark} label="Assigned to">
              <div className="flex items-center gap-2.5 mt-2">
                <SmallAvatar user={assigned} size={32} />
                <Text weight="medium" style={{ fontSize: '15px' }}>{assigned.userName ?? 'Unknown'}</Text>
              </div>
            </DetailSection>
          )}

          {user && (
            <DetailSection icon={<Edit3 size={13} />} color={COLORS.info} label="By">
              <div className="flex items-center gap-2.5 mt-2">
                <SmallAvatar user={user} size={32} />
                <Text weight="medium" style={{ fontSize: '15px' }}>{user.userName ?? 'Unknown'}</Text>
              </div>
            </DetailSection>
          )}
        </div>

        <div className="mt-6 flex-shrink-0 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl text-white transition-opacity hover:opacity-90 active:scale-95 shadow-md"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text weight="semibold" style={{ fontSize: '15px' }}>Close</Text>
          </button>
        </div>
      </div>
    </div>
  );
};
