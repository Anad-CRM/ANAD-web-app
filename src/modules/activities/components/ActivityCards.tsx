import React, { useState } from 'react';
import { User, PlayCircle } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import { AuthImage } from '@/core/components/ui/AuthImage';
import { AudioPlayerModal } from '@/core/components/ui/AudioPlayerModal';
import { getRecordingUrl } from '@/modules/calls/api/callsApi';
import { Activity, FollowupConfig, StatusConfig } from '../types/activity.types';

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

const ActivityNotes: React.FC<{ notes?: string }> = ({ notes }) => {
  if (!notes) return null;
  return (
    <div className="mt-2 p-2 bg-slate-50/80 rounded-lg border border-slate-100/50">
      <Text className="text-slate-600 italic leading-relaxed" style={{ fontSize: '11px' }}>
        "{notes}"
      </Text>
    </div>
  );
};

export const RecordingCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const [playingRecordingUrl, setPlayingRecordingUrl] = useState<string | null>(null);
  const title = activity.title ?? 'Call Recording';
  const user = activity.user;
  
  return (
    <div className="flex flex-col">
      <AudioPlayerModal 
        isOpen={!!playingRecordingUrl}
        onClose={() => setPlayingRecordingUrl(null)}
        src={playingRecordingUrl || ""}
      />
      <Text weight="bold" className="text-black leading-tight" style={{ fontSize: '14px' }}>
        {title}
      </Text>
      <Text weight="medium" className="text-gray-500 mt-0.5" style={{ fontSize: '12px' }}>
        By {user?.userName ?? 'test organization'}
      </Text>

      {activity.fileName && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setPlayingRecordingUrl(getRecordingUrl(activity.fileName!));
          }}
          className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50/40 hover:bg-blue-50 transition-colors rounded-xl border border-blue-100/50 w-full sm:w-auto active:scale-[0.98]"
        >
          <div className="w-6 h-6 rounded-full bg-blue-100/50 flex items-center justify-center flex-shrink-0">
            <PlayCircle size={14} className="text-[#1E40AF]" />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="font-semibold text-[#1E40AF] text-left truncate w-full" style={{ fontSize: '11px' }}>Play Recording</span>
          </div>
        </button>
      )}

      <ActivityNotes notes={activity.description ?? activity.notes} />
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
      <ActivityNotes notes={activity.description ?? activity.notes} />
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
      <ActivityNotes notes={activity.description ?? activity.notes} />
    </div>
  );
};
