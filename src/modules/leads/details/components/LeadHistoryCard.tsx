import React, { useState } from 'react';
import {
  Plus, Phone, MessageCircle, Users, FileText, CheckCircle2,
  Flame, PhoneIncoming, Clock, BadgeCheck, CheckCircle,
  UserPlus, XCircle, ThumbsDown, PhoneMissed, MinusCircle,
  PhoneOff, UserCheck, RefreshCw, Mic, PlayCircle, Headphones,
  ArrowRight, ChevronRight, Sparkles, MapPin, History, User,
} from 'lucide-react';
import { Text } from '@/core/components/ui/Text';
import { COLORS } from '@/core/components/theme/colors';
import { API_BASE_URL } from '@/core/api/axios';
import { ActivityDetailModal } from './ActivityDetailModal';
import { AddActivityModal } from './AddActivityModal';
import { AuthImage } from '@/core/components/ui/AuthImage';

// ── Activity kind classifier (mirrors _activityKind) ─────────────────────────
type Kind = 'call_recording' | 'followup' | 'manual' | 'status';

function getKind(a: any): Kind {
  if (a.type?.toString() === 'call_recording') return 'call_recording';
  if (a.type != null) return 'followup';
  if (a.status == null && a.title != null) return 'manual';
  return 'status';
}

// ── Followup config (mirrors _getFollowupConfig) ─────────────────────────────
interface FCfg { icon: React.ReactNode; color: string; bg: string; label: string }

function getFollowupCfg(a: any): FCfg {
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
}

// ── Status config (mirrors _getStatusConfig) ──────────────────────────────────
interface SCfg { icon: React.ReactNode; color: string }

function getStatusCfg(status: string): SCfg {
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
}

// ── Date / time helpers ───────────────────────────────────────────────────────
function fmtDateTime(rawDate: string) {
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
  return { dateStr, timeStr, fullStr: new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(dt) };
}

function fmtDuration(sec: number): string {
  if (!sec) return '0s';
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

// ── Small User Avatar (mirrors _buildSmallUserAvatar) ─────────────────────────
const SmallAvatar: React.FC<{ user: any; size?: number }> = ({ user, size = 20 }) => {
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

// ── Status Chip (mirrors _statusChip) ─────────────────────────────────────────
const Chip: React.FC<{ label: string; color: string; grey?: boolean }> = ({ label, color, grey }) => (
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

// ── Recording Card (mirrors _buildRecordingCard) ──────────────────────────────
const RecordingCard: React.FC<{ activity: any }> = ({ activity }) => {
  const title = activity.title ?? 'Call Recording';
  const desc = activity.description ?? '';
  const phone = activity.phoneNumber;
  const callType = activity.callType ?? '';
  const duration = Number(activity.duration ?? 0);
  const fileSize = Number(activity.fileSize ?? 0);
  const user = activity.user;
  const hasFile = !!activity.fileName;

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: `${COLORS.anccent_green}0F`, border: `1px solid ${COLORS.anccent_green}40` }}>
      {/* Header */}
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

      {/* Description / phone */}
      {(desc || phone) && (
        <p className="text-[12px] mt-1.5 ml-8 line-clamp-2" style={{ color: `${COLORS.primary}BF` }}>
          {desc || phone}
        </p>
      )}

      {/* Play chip */}
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

      {/* Author */}
      {user && (
        <div className="flex items-center gap-1.5 mt-2 ml-8">
          <SmallAvatar user={user} />
          <span className="text-[10px] text-slate-500">By {user.userName ?? 'Unknown'}</span>
        </div>
      )}
    </div>
  );
};

// ── Manual / Followup Card (mirrors _buildManualCard) ─────────────────────────
const ManualCard: React.FC<{ activity: any; cfg: FCfg }> = ({ activity, cfg }) => {
  const desc = activity.description ?? activity.notes;
  const user = activity.user ?? activity.staff;

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}40` }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${cfg.color}26`, color: cfg.color }}>
          {cfg.icon}
        </div>
        <span className="flex-1 text-[13px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
      </div>

      {/* Description block */}
      {desc && (
        <div className="mt-2 w-full px-2.5 py-2 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.65)' }}>
          <p className="text-[13px] line-clamp-4" style={{ color: `${COLORS.primary}CC` }}>{desc}</p>
        </div>
      )}

      {/* Author */}
      {user && (
        <div className="flex items-center gap-1.5 mt-2">
          <SmallAvatar user={user} />
          <span className="text-[10px] text-slate-500">By {user.userName ?? 'Unknown'}</span>
        </div>
      )}
    </div>
  );
};

// ── Status Card (mirrors _buildStatusCard) ────────────────────────────────────
const StatusCard: React.FC<{ activity: any; cfg: SCfg }> = ({ activity, cfg }) => {
  const cur = activity.status ?? '';
  const prev = activity.previous_status;
  const user = activity.user;
  const assignedUser = activity.assignedUser;
  const isReassign = assignedUser && (cur.toLowerCase() === 'assigned' || cur.toLowerCase() === 'follow up');

  return (
    <div className="rounded-xl px-3 py-2.5 bg-white" style={{ border: '1px solid rgba(219,234,254,0.8)' }}>
      {/* Status row */}
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

      {/* Reassignment */}
      {isReassign && assignedUser && (
        <div className="flex items-center gap-1.5 mt-2">
          <MapPin size={12} style={{ color: COLORS.primaryDark }} />
          <span className="text-[10px] font-semibold truncate" style={{ color: COLORS.primaryDark }}>
            Assigned to {assignedUser.userName ?? 'Unknown'}
          </span>
        </div>
      )}

      {/* Done by */}
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


// ── Main Component ────────────────────────────────────────────────────────────
export const LeadHistoryCard: React.FC<{ activities: any[] }> = ({ activities }) => {
  const [selected, setSelected] = useState<any | null>(null);
  const [showAddSheet, setAddSheet] = useState(false);

  return (
    <>
      <div className="bg-[#F8F7F3] rounded-[32px] p-6 shadow-sm border border-black/5 flex flex-col relative h-[calc(100vh-120px)] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <Text size="xl" weight="semibold" className="text-black">Activities</Text>
          {/* <button className="text-[13px] font-medium text-[#1C3A76] hover:underline">View All</button> */}
          {/* FAB */}
          <button
            id="add-activity-btn"
            onClick={() => setAddSheet(true)}
            className="absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 hover:opacity-90 z-20"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Plus className="w-6 h-6" />
          </button>

        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-16 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
          {/* Empty state */}
          {activities.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 h-full">
              <History size={52} strokeWidth={1.3} className="text-slate-300" />
              <div className="text-center">
                <p className="font-semibold text-slate-500 text-[15px]">No Activities Yet</p>
                <p className="text-[13px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Start tracking your interactions with this lead
                </p>
              </div>
            </div>
          ) : (
            /* Timeline list */
            <div className="flex flex-col">
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
                    key={i}
                    className="flex gap-3 cursor-pointer"
                    onClick={() => kind !== 'call_recording' && setSelected(activity)}
                  >
                    {/* Time column */}
                    <div className="flex flex-col items-end pt-1.5 flex-shrink-0" style={{ width: 54 }}>
                      <span className="text-[11px] font-semibold text-slate-700 leading-none">{timeStr}</span>
                      <span className="text-[10px] font-medium text-slate-400 mt-0.5">{dateStr}</span>
                    </div>

                    {/* Dot + line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-2 ring-[3px] ring-[#F8F7F3] flex-shrink-0"
                        style={{ backgroundColor: dotColor }}
                      />
                      {!isLast && (
                        <div className="w-px flex-1 mt-1" style={{ backgroundColor: '#E2E8F0', minHeight: 20 }} />
                      )}
                    </div>

                    {/* Card */}
                    <div className="flex-1 pb-4 min-w-0">{card}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>

      {/* Activity detail modal */}
      {selected && <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />}

      {/* Add activity modal */}
      {showAddSheet && <AddActivityModal onClose={() => setAddSheet(false)} />}
    </>
  );
};
