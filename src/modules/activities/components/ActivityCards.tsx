import React from 'react';
import { 
  Phone, MessageCircle, Users, FileText, CheckCircle2, 
  Flame, PhoneIncoming, Clock, BadgeCheck, CheckCircle, 
  UserPlus, XCircle, ThumbsDown, PhoneMissed, MinusCircle, 
  PhoneOff, UserCheck, RefreshCw, Mic, PlayCircle, Headphones, 
  ArrowRight, ChevronRight, Sparkles, MapPin, User 
} from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { AuthImage } from '@/core/components/ui/AuthImage';
import { Activity, FollowupConfig, StatusConfig } from '../types/activity.types';

export const SmallAvatar: React.FC<{ user: any; size?: number }> = ({ user, size = 20 }) => {
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
  const desc = activity.description ?? '';
  const phone = activity.phoneNumber;
  const callType = activity.callType ?? '';
  const duration = Number(activity.duration ?? 0);
  const fileSize = Number(activity.fileSize ?? 0);
  const user = activity.user;
  const hasFile = !!activity.fileName;

  const fmtDuration = (sec: number): string => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60), s = sec % 60;
    if (m === 0) return `${s}s`;
    if (s === 0) return `${m}m`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: `${COLORS.anccent_green}0F`, border: `1px solid ${COLORS.anccent_green}40` }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${COLORS.anccent_green}26`, color: COLORS.anccent_green }}>
          <Mic size={12} />
        </div>
        <span className="flex-1 text-[13px] font-bold" style={{ color: COLORS.anccent_green }}>{title}</span>
        {callType && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${COLORS.anccent_green}1F`, color: COLORS.anccent_green }}>
            {callType}
          </span>
        )}
      </div>

      {(desc || phone) && (
        <p className="text-[12px] mt-1.5 ml-8 line-clamp-2" style={{ color: `${COLORS.primary}BF` }}>
          {desc || phone}
        </p>
      )}

      {hasFile && (
        <div className="mt-2 ml-8 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer"
          style={{ backgroundColor: `${COLORS.primary}12`, border: `1px solid ${COLORS.primary}33` }}>
          <PlayCircle size={15} color={COLORS.primary} />
          <span className="text-[11px] font-medium" style={{ color: COLORS.primary }}>
            Play Recording{duration ? ` · ${fmtDuration(duration)}` : ''}
            {fileSize > 0 ? ` · ${(fileSize / 1024).toFixed(1)}KB` : ''}
          </span>
          <Headphones size={12} color={COLORS.primary} />
        </div>
      )}

      {user && (
        <div className="flex items-center gap-1.5 mt-2 ml-8">
          <SmallAvatar user={user} />
          <span className="text-[10px] text-slate-500">By {user.userName ?? 'Unknown'}</span>
        </div>
      )}
    </div>
  );
};

export const ManualCard: React.FC<{ activity: Activity; cfg: FollowupConfig }> = ({ activity, cfg }) => {
  const desc = activity.description ?? activity.notes;
  const user = activity.user ?? activity.staff;

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}40` }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${cfg.color}26`, color: cfg.color }}>
          {cfg.icon}
        </div>
        <span className="flex-1 text-[13px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
      </div>

      {desc && (
        <div className="mt-2 w-full px-2.5 py-2 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.65)' }}>
          <p className="text-[13px] line-clamp-4" style={{ color: `${COLORS.primary}CC` }}>{desc}</p>
        </div>
      )}

      {user && (
        <div className="flex items-center gap-1.5 mt-2">
          <SmallAvatar user={user} />
          <span className="text-[10px] text-slate-500">By {user.userName ?? 'Unknown'}</span>
        </div>
      )}
    </div>
  );
};

export const StatusCard: React.FC<{ activity: Activity; cfg: StatusConfig }> = ({ activity, cfg }) => {
  const cur = activity.status ?? '';
  const prev = activity.previous_status;
  const user = activity.user;
  const assignedUser = activity.assignedUser;
  const isReassign = assignedUser && (cur.toLowerCase() === 'assigned' || cur.toLowerCase() === 'follow up');

  return (
    <div className="rounded-xl px-3 py-2.5 bg-white" style={{ border: '1px solid rgba(219,234,254,0.8)' }}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span style={{ color: cfg.color }} className="flex-shrink-0">{cfg.icon}</span>
        {prev && prev.trim() && (
          <>
            <Chip label={prev} color="#64748B" grey />
            <ArrowRight size={11} className="text-slate-400 flex-shrink-0" />
          </>
        )}
        <Chip label={cur} color={cfg.color} />
        <div className="ml-auto">
          <ChevronRight size={14} className="text-slate-300" />
        </div>
      </div>

      {isReassign && assignedUser && (
        <div className="flex items-center gap-1.5 mt-2">
          <MapPin size={12} style={{ color: COLORS.primaryDark }} />
          <span className="text-[10px] font-semibold truncate" style={{ color: COLORS.primaryDark }}>
            Assigned to {assignedUser.userName ?? 'Unknown'}
          </span>
        </div>
      )}

      {user
        ? (
          <div className="flex items-center gap-1.5 mt-1.5">
            <SmallAvatar user={user} />
            <span className="text-[10px] text-slate-500">By {user.userName ?? 'Unknown'}</span>
          </div>
        )
        : assignedUser && !isReassign
          ? (
            <div className="flex items-center gap-1.5 mt-1.5">
              <SmallAvatar user={assignedUser} />
              <span className="text-[10px] text-slate-500">{assignedUser.userName ?? 'Unknown'}</span>
            </div>
          )
          : null
      }
    </div>
  );
};
