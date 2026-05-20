import React from "react";
import { FollowUp } from "../types";

export default function RightPanel({
  missedFollowUps,
  viewMode,
  setViewMode,
  selectedDate,
  onSelectDate,
}: {
  missedFollowUps: FollowUp[];
  viewMode: "calendar" | "list";
  setViewMode: (mode: "calendar" | "list") => void;
  selectedDate?: string | null;
  onSelectDate?: (date: string | null) => void;
}) {
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

  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  const month = now.getMonth();
  
  let startDayOfWeek = new Date(year, month, 1).getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const formatLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const calendarDays = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, d);
    calendarDays.push({ day: d, isCurrentMonth: false, isToday: false, dateStr: formatLocal(dateObj) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    calendarDays.push({ day: i, isCurrentMonth: true, isToday: i === now.getDate(), dateStr: formatLocal(dateObj) });
  }
  const totalSlots = calendarDays.length > 35 ? 42 : 35;
  const extra = totalSlots - calendarDays.length;
  for (let i = 1; i <= extra; i++) {
    const dateObj = new Date(year, month + 1, i);
    calendarDays.push({ day: i, isCurrentMonth: false, isToday: false, dateStr: formatLocal(dateObj) });
  }

  return (
    <div className="w-[380px] shrink-0 bg-[#C8D6E5]/40 rounded-3xl p-6 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar">
      <div className="shrink-0">
        <div className="flex items-center gap-2 mb-6 bg-white/40 rounded-full p-1 border border-white shrink-0">
        <button
          onClick={() => setViewMode("calendar")}
          className={`flex-1 rounded-full py-2.5 text-[15px] font-semibold flex items-center justify-center gap-2 transition-all ${
            viewMode === "calendar"
              ? "bg-[#233A78] text-white shadow-md"
              : "text-gray-700 hover:text-black"
          }`}
        >
          <CalendarIcon /> Calendar view
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 rounded-full py-2.5 text-[15px] font-semibold flex items-center justify-center gap-2 transition-all ${
            viewMode === "list"
              ? "bg-[#233A78] text-white shadow-md"
              : "text-gray-700 hover:text-black"
          }`}
        >
          <ListIcon /> List View
        </button>
      </div>

        {viewMode === "calendar" && (
          <div className="bg-white/40 border border-white rounded-[24px] p-5 mb-6 shadow-sm overflow-hidden shrink-0">
            <div className="flex justify-center mb-4">
              <div className="bg-[#233A78] text-white text-[12px] font-semibold px-4 py-1 rounded-full">
                {currentMonth}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-[11px] font-bold text-gray-700">
              <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
              
              {calendarDays.map((item, idx) => (
                 <button 
                    key={idx} 
                    onClick={() => onSelectDate && onSelectDate(item.dateStr)}
                    className={
                      item.dateStr === selectedDate
                      ? "bg-[#4B73B2] text-white rounded-md p-1 aspect-square flex items-center justify-center m-0.5 border border-[#233A78] shadow-inner"
                      : item.isCurrentMonth
                        ? item.isToday 
                           ? "bg-red-600 text-white rounded-md p-1 aspect-square flex items-center justify-center m-0.5 shadow-sm" 
                           : "bg-[#233A78] text-white rounded-md p-1 aspect-square flex items-center justify-center m-0.5 hover:bg-[#1a2b5e] cursor-pointer shadow-sm transition-colors"
                        : "text-gray-400 aspect-square flex items-center justify-center m-0.5 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
                    }>
                    {item.day}
                 </button>
              ))}
            </div>
          </div>
        )}
      
      </div>

      <div className="flex flex-col gap-3 mt-6 pr-2">
        {missedFollowUps.map((item) => (
          <div key={item.id} className="bg-[#1C2C5E] rounded-3xl p-4 text-white shadow-lg relative shrink-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-[16px] font-semibold">{item.lead?.userName || "Unknown"}</h4>
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

            <div className="flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Remark" 
                className="bg-white/90 text-black text-[13px] rounded-full px-4 py-2 w-full max-w-[140px] outline-none"
              />
              <div className="flex items-center gap-1.5 text-[12px] text-white/90 truncate flex-1">
                <UserSmallIcon /> {item.userName || "Admin"}
              </div>
              <button className="bg-white text-red-500 font-semibold px-4 py-1.5 rounded-full text-[13px] shadow-sm shrink-0">
                Missed
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
