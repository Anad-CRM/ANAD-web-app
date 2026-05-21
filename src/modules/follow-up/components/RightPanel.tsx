import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FollowUp } from "../types";
import { getFollowUps } from "../api/followUpApi";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

export default function RightPanel({
  missedFollowUps,
  viewMode,
  setViewMode,
  selectedDate,
  onSelectDate,
  onReschedule,
}: {
  missedFollowUps: FollowUp[];
  viewMode: "calendar" | "list";
  setViewMode: (mode: "calendar" | "list") => void;
  selectedDate?: string | null;
  onSelectDate?: (date: string | null) => void;
  onReschedule?: (id: number) => void;
}) {
  const [remarkValues, setRemarkValues] = useState<Record<number, string>>({});
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());

  // State-driven calendar month
  const now = useMemo(() => new Date(), []);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed
  const monthLabel = new Date(calYear, calMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const formatLocal = useCallback((d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const isViewingCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  useEffect(() => {
    const m = calMonth + 1;
    const lastDayOfMonth = new Date(calYear, calMonth + 1, 0).getDate();
    
    const fromScheduledDate = `${calYear}-${String(m).padStart(2, '0')}-01`;
    const toScheduledDate = `${calYear}-${String(m).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    getFollowUps({ limit: 500, page: 1, fromScheduledDate, toScheduledDate })
      .then((res) => {
        const dates = new Set<string>();
        res.data?.forEach((f) => {
          const rawDate = f.date || f.createdAt;
          if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              const y = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              dates.add(`${y}-${mm}-${day}`);
            }
          }
        });
        setActiveDates(dates);
      })
      .catch((e) => console.error("Failed to load indicator dates", e));
  }, [calYear, calMonth]);

  const formatSafeDate = (dateStr?: string, fallback?: string) => {
    let d = new Date(dateStr || "");
    if (isNaN(d.getTime())) {
      d = new Date(fallback || "");
      if (isNaN(d.getTime())) return "N/A";
    }
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long" });
  };

  const formatSafeTime = (dateStr?: string, fallback?: string) => {
    let d = new Date(dateStr || "");
    if (isNaN(d.getTime())) {
      d = new Date(fallback || "");
      if (isNaN(d.getTime())) return "N/A";
    }
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  };

  const calendarDays = useMemo(() => {
    let startDayOfWeek = new Date(calYear, calMonth, 1).getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    const days = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateObj = new Date(calYear, calMonth - 1, d);
      days.push({ day: d, isCurrentMonth: false, isToday: false, dateStr: formatLocal(dateObj) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(calYear, calMonth, i);
      const isToday = isViewingCurrentMonth && i === now.getDate();
      days.push({ day: i, isCurrentMonth: true, isToday, dateStr: formatLocal(dateObj) });
    }
    const totalSlots = days.length > 35 ? 42 : 35;
    const extra = totalSlots - days.length;
    for (let i = 1; i <= extra; i++) {
      const dateObj = new Date(calYear, calMonth + 1, i);
      days.push({ day: i, isCurrentMonth: false, isToday: false, dateStr: formatLocal(dateObj) });
    }
    return days;
  }, [calYear, calMonth, isViewingCurrentMonth, now, formatLocal]);

  return (
    <div className="w-full xl:w-[380px] shrink-0 rounded-3xl p-4 sm:p-6 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar" style={{ backgroundColor: "rgba(200,214,229,0.4)" }}>
      <div className="shrink-0">
        <div className="flex items-center gap-2 mb-6 bg-white/40 rounded-full p-1 border border-white shrink-0">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex-1 rounded-full py-2.5 text-[15px] font-semibold flex items-center justify-center gap-2 transition-all ${
              viewMode === "calendar"
                ? "text-white shadow-md"
                : "hover:text-black"
            }`}
            style={viewMode === "calendar" ? { backgroundColor: COLORS.primaryDark, color: COLORS.surface } : { color: COLORS.text }}
          >
            <CalendarIcon /> Calendar view
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 rounded-full py-2.5 text-[15px] font-semibold flex items-center justify-center gap-2 transition-all ${
              viewMode === "list"
                ? "text-white shadow-md"
                : "hover:text-black"
            }`}
            style={viewMode === "list" ? { backgroundColor: COLORS.primaryDark, color: COLORS.surface } : { color: COLORS.text }}
          >
            <ListIcon /> List View
          </button>
        </div>

        {viewMode === "calendar" && (
          <div className="bg-white/40 border border-white rounded-[24px] p-5 mb-6 shadow-sm overflow-hidden shrink-0">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePrevMonth} 
                className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-600 transition-colors shadow-sm"
                style={{ color: COLORS.primaryDark }}
              >
                <ChevronLeftIcon />
              </button>
              <div className="text-white text-[12px] font-semibold px-4 py-1 rounded-full" style={{ backgroundColor: COLORS.primaryDark }}>
                {monthLabel}
              </div>
              <button 
                onClick={handleNextMonth} 
                className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-600 transition-colors shadow-sm"
                style={{ color: COLORS.primaryDark }}
              >
                <ChevronRightIcon />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-[11px] font-bold text-gray-700">
              <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
              
              {calendarDays.map((item, idx) => {
                 const isSelected = item.dateStr === selectedDate;
                 const hasFollowUp = activeDates.has(item.dateStr);
                 
                 let bgClass = "bg-transparent hover:bg-white/50";
                 let textClass = "text-gray-400";
                 
                 if (item.isCurrentMonth) {
                   if (item.isToday) {
                     bgClass = "bg-[#10b981] shadow-sm"; 
                     textClass = "text-white";
                   } else {
                     bgClass = "bg-white/60 hover:bg-white shadow-sm"; 
                     textClass = "text-slate-800";
                   }
                 }
                 
                 const borderClass = isSelected ? "border-[2px]" : "border border-transparent";

                 return (
                   <button 
                      key={idx} 
                      onClick={() => onSelectDate && onSelectDate(item.dateStr)}
                      className={`aspect-square flex flex-col items-center justify-center m-0.5 rounded-md cursor-pointer transition-all relative ${bgClass} ${textClass} ${borderClass}`}
                    >
                      <span>{item.day}</span>
                      {hasFollowUp && (
                        <span 
                          className={`absolute bottom-0.5 w-[5px] h-[5px] rounded-full ${
                            (item.isCurrentMonth && item.isToday) ? 'bg-white' : 'bg-[#EF4444]'
                          }`} 
                          title="Follow-ups scheduled" 
                        />
                      )}
                   </button>
                 );
              })}
            </div>
          </div>
        )}
      
      </div>

      {/* Missed Follow-ups Section */}
      {missedFollowUps.length > 0 && (
        <div className="shrink-0 mb-2">
          <Text as="h3" size="sm" weight="bold" className="mb-3" style={{ color: COLORS.text }}>Missed Follow-ups</Text>
        </div>
      )}
      <div className="flex flex-col gap-3 pr-2">
        {missedFollowUps.map((item) => (
          <div key={item.id} className="rounded-3xl p-4 text-white shadow-lg relative shrink-0" style={{ backgroundColor: COLORS.primaryDark }}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <div>
                <Text as="h4" size="base" weight="semibold" style={{ color: COLORS.surface }}>{item.lead?.userName || "Unknown"}</Text>
                <div className="text-[12px] text-white/70 flex items-center gap-1 mt-0.5">
                  <PhoneSmallIcon /> {item.lead?.mobileNumber || "N/A"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold">
                  {formatSafeDate(item.date, item.createdAt)}
                </div>
                <div className="text-[11px] text-white/70 flex items-center justify-end gap-1 mt-0.5">
                  <ClockSmallIcon /> {formatSafeTime(item.date, item.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input 
                type="text" 
                placeholder="Remark" 
                value={remarkValues[item.id] || ""}
                onChange={(e) => setRemarkValues(prev => ({ ...prev, [item.id]: e.target.value }))}
                className="bg-white/90 text-black text-[13px] rounded-full px-4 py-2 w-full sm:max-w-[140px] outline-none"
              />
              <div className="flex items-center gap-1.5 text-[12px] text-white/90 truncate flex-1">
                <UserSmallIcon /> {item.userName || "Admin"}
              </div>
              <button 
                onClick={() => onReschedule && onReschedule(item.id)}
                className="bg-white text-red-500 font-semibold px-4 py-1.5 rounded-full text-[13px] shadow-sm shrink-0 hover:bg-red-50 transition-colors w-full sm:w-auto"
              >
                Reschedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function CalendarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ListIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function PhoneSmallIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function ClockSmallIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function UserSmallIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function ChevronLeftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevronRightIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>;
}
