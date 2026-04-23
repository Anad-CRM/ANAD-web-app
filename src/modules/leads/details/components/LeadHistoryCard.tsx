import React from 'react';
import { Plus } from 'lucide-react';
import { Text } from '@/core/components/ui/Text';
import { COLORS } from '@/core/components/theme/colors';

// Helper for status config translated from Flutter
const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'new lead') return { color: '#1E3A8A' }; // navyBlue
  if (s === 'hot lead') return { color: '#B71C1C' };
  if (s === 'contacted') return { color: '#0F766E' }; // tealBlue
  if (s === 'follow up') return { color: '#1D4ED8' }; // midBlue
  if (s === 'qualified') return { color: '#F59E0B' }; // secondaryColor
  if (s === 'converted') return { color: '#1B5E20' };
  if (s === 'assigned') return { color: '#312E81' }; // spaceBlue
  if (s === 'lost') return { color: '#C62828' };
  if (s === 'not interested') return { color: '#334155' }; // steelBlue
  if (s === 'rnr') return { color: '#0284C7' }; // tertiaryColor
  if (s === 'busy') return { color: '#BF360C' };
  if (s === 'switch off') return { color: '#1E3A8A' }; // deepBlue
  if (s === 'registered') return { color: '#F59E0B' }; // secondaryColor
  return { color: COLORS.primary };
};

// Helper for follow-up config translated from Flutter
const getFollowupConfig = (type: string, title?: string) => {
  const t = (type || title || '').toUpperCase();
  if (t.includes('CALL') || t.includes('PHONE')) {
    return { color: '#0F766E', bg: 'rgba(15, 118, 110, 0.08)' };
  } else if (t.includes('TEXT') || t.includes('MESSAGE') || t.includes('WHATSAPP')) {
    return { color: '#1E3A8A', bg: 'rgba(30, 58, 138, 0.08)' };
  } else if (t.includes('MEETING')) {
    return { color: '#1D4ED8', bg: 'rgba(29, 78, 216, 0.08)' };
  } else if (t.includes('NOTE')) {
    return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' };
  }
  return { color: COLORS.primary, bg: 'rgba(28, 58, 118, 0.07)' }; // primaryColor
};

export const LeadHistoryCard: React.FC<{ activities: any[] }> = ({ activities }) => {
  
  // Create mapped history from real activities payload
  const history = activities.map((activ) => {
    const rawDate = activ.created_at || activ.createdAt || new Date().toISOString();
    const dt = new Date(rawDate);
    
    // Formatting date
    const today = new Date();
    const isToday = dt.getDate() === today.getDate() && dt.getMonth() === today.getMonth() && dt.getFullYear() === today.getFullYear();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = dt.getDate() === yesterday.getDate() && dt.getMonth() === yesterday.getMonth() && dt.getFullYear() === yesterday.getFullYear();
    
    let dateStr = '';
    if (isToday) dateStr = 'Today';
    else if (isYesterday) dateStr = 'Yesterday';
    else dateStr = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(dt);
    
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(dt);
    
    // Categorize
    const isFollowup = !!activ.type;
    const isManual = !activ.status && !!activ.title;
    
    let title = activ.title || 'Activity';
    let subtitle = '';
    let color = COLORS.primary;
    
    const user = activ.user || activ.staff;
    const userName = user?.userName ? `By ${user.userName}` : '';

    if (isFollowup || isManual) {
      const cfg = getFollowupConfig(activ.type, activ.title);
      color = cfg.color;
      subtitle = activ.description || activ.notes || userName;
    } else {
      const cfg = getStatusConfig(activ.status || '');
      color = cfg.color;
      title = `${activ.previous_status ? activ.previous_status + ' → ' : ''}${activ.status}`;
      
      const assignedUser = activ.assignedUser;
      if (assignedUser && (activ.status?.toLowerCase() === 'assigned' || activ.status?.toLowerCase() === 'follow up')) {
        subtitle = `Assigned to ${assignedUser.userName || 'Unknown'}`;
      } else {
        subtitle = userName;
      }
    }
    
    return {
      time: timeStr,
      date: dateStr,
      title: title,
      subtitle: subtitle,
      color: color,
    };
  });

  return (
    <div className="bg-[#F8F7F3] rounded-[32px] p-6 shadow-sm border border-black/5 flex flex-col relative min-h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <Text size="xl" weight="semibold" className="text-black">History</Text>
        <button className="text-[13px] font-medium text-[#1C3A76] hover:underline">View All</button>
      </div>
      
      {history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">
          No activities yet
        </div>
      ) : (
        <div className="flex flex-col gap-0 relative ml-4">
          <div className="absolute left-[73px] top-2 bottom-6 w-[1.5px] bg-[#E2E8F0]" />
          
          {history.map((item, i) => (
            <div key={i} className="flex gap-6 mb-10 last:mb-0 relative group">
              <div className="flex flex-col items-end w-[60px] pt-1 flex-shrink-0">
                <Text size="custom" weight="semibold" className="text-[13px] text-slate-700 leading-none">{item.time}</Text>
                <Text size="custom" weight="medium" className="text-[11px] text-slate-500 mt-1">{item.date}</Text>
              </div>
              
              <div className="relative z-10 pt-1.5 flex-shrink-0">
                <div 
                  className="w-3.5 h-3.5 rounded-full ring-4 ring-[#F8F7F3]" 
                  style={{ backgroundColor: item.color }} 
                />
              </div>

              <div className="flex flex-col pt-0.5 max-w-[280px]">
                <Text size="sm" weight="semibold" className="text-slate-800 leading-tight block">{item.title}</Text>
                {item.subtitle && (
                  <Text size="custom" weight="medium" className="text-[12px] text-slate-500 mt-1.5 line-clamp-3">
                    {item.subtitle}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 hover:opacity-90 z-20" style={{ backgroundColor: COLORS.primary }}>
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
