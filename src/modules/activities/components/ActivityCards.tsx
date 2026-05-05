import React from 'react';
import { User } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { AuthImage } from '@/core/components/ui/AuthImage';
import { AudioPlayer } from '@/core/components/ui/AudioPlayer';
import { Activity, FollowupConfig, StatusConfig } from '../types/activity.types';
import { API_ENDPOINTS } from '@/core/api/api';

export const SmallAvatar: React.FC<{ user: { avatar?: string, userName?: string } | null | undefined; size?: number }> = ({ user, size = 20 }) => {
  const av = user?.avatar;
  const name = user?.userName ?? '?';
  return (
    <div
      className="rounded-full relative flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: `${COLORS.primary}33` }}
    >
      <User size={size * 0.55} color={COLORS.primary} className="absolute" />
      {av && (
        <AuthImage src={`uploads/${av}`} alt={name} className="w-full h-full object-cover relative z-10" />
      )}
    </div>
  );
};

export const Chip: React.FC<{ label: string; color: string; grey?: boolean }> = ({ label, color, grey }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
    style={grey
      ? { color: '#475569', backgroundColor: '#F1F5F9' }
      : { color, backgroundColor: `${color}1A` }
    }
  >
    {label}
  </span>
);

export const RecordingCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const title = activity.title ?? 'Call Recording';
  const duration = Number(activity.duration ?? 0);
  const fileSize = Number(activity.fileSize ?? 0);
  const user = activity.user;
  const hasFile = !!activity.fileName;

  return (
    <div className="flex flex-col">
      <span className="text-[14px] font-bold text-black leading-tight">
        {title}
      </span>
      <span className="text-[12px] text-gray-500 mt-0.5 font-medium">
        By {user?.userName ?? 'test organization'}
      </span>

      {hasFile && (
        <div className="mt-2 text-left">
          <AudioPlayer 
            src={API_ENDPOINTS.CALLS.RECORDING(activity.fileName || "")} 
            initialDuration={duration} 
            fileSize={fileSize} 
            className="w-full max-w-[300px]" 
          />
        </div>
      )}
    </div>
  );
};

export const ManualCard: React.FC<{ activity: Activity; cfg: FollowupConfig }> = ({ activity }) => {
  const title = activity.title ?? 'New Activity';
  const user = activity.user ?? activity.staff;

  return (
    <div className="flex flex-col">
      <span className="text-[14px] font-bold text-black leading-tight">
        {title}
      </span>
      <span className="text-[12px] text-gray-500 mt-0.5 font-medium">
        By {user?.userName ?? 'test organization'}
      </span>
    </div>
  );
};

export const StatusCard: React.FC<{ activity: Activity; cfg: StatusConfig }> = ({ activity }) => {
  const cur = activity.status ?? 'New Lead';
  const isAssigned = cur.toLowerCase() === 'assigned';
  const displayTitle = isAssigned ? 'New Lead - Assigned' : cur;
  const user = activity.user ?? activity.assignedUser;

  return (
    <div className="flex flex-col">
      <span className="text-[14px] font-bold text-black leading-tight">
        {displayTitle}
      </span>
      <span className="text-[12px] text-gray-500 mt-0.5 font-medium">
        By {user?.userName ?? 'test organization'}
      </span>
    </div>
  );
};
