import React from 'react';
import { 
  Phone, MessageCircle, Users, FileText, CheckCircle2, 
  Flame, PhoneIncoming, Clock, BadgeCheck, CheckCircle, 
  UserPlus, XCircle, ThumbsDown, PhoneMissed, MinusCircle, 
  PhoneOff, UserCheck, RefreshCw, Sparkles 
} from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Activity, ActivityKind, FollowupConfig, StatusConfig } from '../types/activity.types';
import { RecordingCard, ManualCard, StatusCard } from './ActivityCards';

const getKind = (a: Activity): ActivityKind => {
  if (a.type?.toString() === 'call_recording') return 'call_recording';
  if (a.type != null) return 'followup';
  if (a.status == null && a.title != null) return 'manual';
  return 'status';
};

const getFollowupCfg = (a: Activity): FollowupConfig => {
  const t = ((a.type ?? a.title) ?? '').toString().toUpperCase();
  if (t.includes('CALL') || t.includes('PHONE'))
    return { icon: <Phone size={13} />, color: COLORS.anccent_green, bg: `${COLORS.anccent_green}14`, label: 'Phone Call' };
  if (t.includes('WHATSAPP'))
    return { icon: <MessageCircle size={13} />, color: COLORS.anccent_green, bg: `${COLORS.anccent_green}14`, label: 'WhatsApp' };
  if (t.includes('TEXT') || t.includes('MESSAGE'))
    return { icon: <MessageCircle size={13} />, color: COLORS.anccent_green, bg: `${COLORS.anccent_green}14`, label: 'Message' };
  if (t.includes('MEETING'))
    return { icon: <Users size={13} />, color: COLORS.warning, bg: `${COLORS.warning}14`, label: 'Meeting' };
  if (t.includes('NOTE'))
    return { icon: <FileText size={13} />, color: COLORS.warning, bg: `${COLORS.warning}14`, label: 'Note' };
  return {
    icon: <CheckCircle2 size={13} />,
    color: COLORS.primary,
    bg: `${COLORS.primary}12`,
    label: a.title?.toString() ?? 'Activity',
  };
};

const getStatusCfg = (status: string): StatusConfig => {
  switch (status.toLowerCase()) {
    case 'new lead': return { icon: <Sparkles size={14} />, color: COLORS.primary };
    case 'hot lead': return { icon: <Flame size={14} />, color: COLORS.danger };
    case 'contacted': return { icon: <PhoneIncoming size={14} />, color: COLORS.primary };
    case 'follow up': return { icon: <Clock size={14} />, color: COLORS.danger };
    case 'qualified': return { icon: <BadgeCheck size={14} />, color: COLORS.primary };
    case 'converted': return { icon: <CheckCircle size={14} />, color: COLORS.primary };
    case 'assigned': return { icon: <UserPlus size={14} />, color: COLORS.primary };
    case 'lost': return { icon: <XCircle size={14} />, color: COLORS.primary };
    case 'not interested': return { icon: <ThumbsDown size={14} />, color: COLORS.primary };
    case 'rnr': return { icon: <PhoneMissed size={14} />, color: COLORS.primary };
    case 'busy': return { icon: <MinusCircle size={14} />, color: COLORS.primary };
    case 'switch off': return { icon: <PhoneOff size={14} />, color: COLORS.primary };
    case 'registered': return { icon: <UserCheck size={14} />, color: COLORS.primary };
    default: return { icon: <RefreshCw size={14} />, color: COLORS.primary };
  }
};

const fmtDateTime = (rawDate: string) => {
  const dt = new Date(rawDate);
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const actMid = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const yestMid = new Date(todayMid); yestMid.setDate(todayMid.getDate() - 1);

  let dateStr: string;
  if (actMid.getTime() === todayMid.getTime()) dateStr = 'Today';
  else if (actMid.getTime() === yestMid.getTime()) dateStr = 'Yesterday';
  else dateStr = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(dt);

  const timeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(dt);
  return { dateStr, timeStr };
};

interface Props {
  activities: Activity[];
  onSelect?: (activity: Activity) => void;
}

export const ActivityTimeline: React.FC<Props> = ({ activities, onSelect }) => {
  return (
    <div className="flex flex-col max-w-[500px] w-full mx-auto pl-4 lg:pl-10">
      {activities.map((activity, i) => {
        const rawDate = activity.created_at ?? activity.createdAt ?? new Date().toISOString();
        const { dateStr, timeStr } = fmtDateTime(rawDate);
        const kind = getKind(activity);
        const isLast = i === activities.length - 1;

        let dotColor: string;
        let card: React.ReactNode;

        if (kind === 'call_recording') {
          dotColor = COLORS.anccent_green;
          card = <RecordingCard activity={activity} />;
        } else if (kind === 'followup' || kind === 'manual') {
          const cfg = getFollowupCfg(activity);
          dotColor = cfg.color;
          card = <ManualCard activity={activity} cfg={cfg} />;
        } else {
          const cfg = getStatusCfg(activity.status ?? '');
          dotColor = cfg.color;
          card = <StatusCard activity={activity} cfg={cfg} />;
        }

        return (
          <div
            key={activity.id || i}
            className="flex gap-5 cursor-pointer"
            onClick={() => kind !== 'call_recording' && onSelect?.(activity)}
          >
            <div className="flex flex-col items-end pt-0.5 flex-shrink-0 w-auto min-w-[70px] text-right">
              <span className="text-[12px] font-bold text-black leading-tight whitespace-nowrap">{timeStr}</span>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5 whitespace-nowrap">{dateStr}</span>
            </div>

            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: i === 1 ? '#2563EB' : '#1E293B', width: '8px', height: '8px' }}
              />
              {!isLast && (
                <div className="w-px flex-1 mt-1.5 mb-1.5" style={{ backgroundColor: '#1E293B', minHeight: 40 }} />
              )}
            </div>

            <div className="flex-1 pb-4 min-w-0">{card}</div>
          </div>
        );
      })}
    </div>
  );
};
