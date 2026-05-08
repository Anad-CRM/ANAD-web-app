import React from 'react';
import { User } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
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
   <Text
    weight="semibold"
    className="inline-flex items-center px-2 py-0.5 rounded-full whitespace-nowrap"
    style={grey
      ? { color: '#475569', backgroundColor: '#F1F5F9', fontSize: '11px' }
      : { color, backgroundColor: `${color}1A`, fontSize: '11px' }
    }
  >
    {label}
  </Text>
);

export const RecordingCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const title = activity.title ?? 'Call Recording';
  const duration = Number(activity.duration ?? 0);
  const fileSize = Number(activity.fileSize ?? 0);
  const user = activity.user;
  return (
    <div className="flex flex-col">
      <Text weight="bold" className="text-black leading-tight" style={{ fontSize: '14px' }}>
        {title}
      </Text>
      <Text weight="medium" className="text-gray-500 mt-0.5" style={{ fontSize: '12px' }}>
        By {user?.userName ?? 'test organization'}
      </Text>

      {activity.fileName && (
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
      <Text weight="bold" className="text-black leading-tight" style={{ fontSize: '14px' }}>
        {title}
      </Text>
      <Text weight="medium" className="text-gray-500 mt-0.5" style={{ fontSize: '12px' }}>
        By {user?.userName ?? 'test organization'}
      </Text>
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
      <Text weight="bold" className="text-black leading-tight" style={{ fontSize: '14px' }}>
        {displayTitle}
      </Text>
      <Text weight="medium" className="text-gray-500 mt-0.5" style={{ fontSize: '12px' }}>
        By {user?.userName ?? 'test organization'}
      </Text>
    </div>
  );
};
