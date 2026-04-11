import React from "react";
import { FollowUpSummary } from "../types";

const STATS = [
  { key: "total", label: "Total", icon: UsersIcon },
  { key: "today", label: "Today", icon: ClockIcon }, 
  { key: "done", label: "Done", icon: CheckIcon },
  { key: "missed", label: "Missed", icon: PhoneMissedIcon },
  { key: "pending", label: "Pending", icon: UserClockIcon },
];

export default function StatsSection({
  summary,
  activeTab,
  onTabChange,
}: {
  summary: FollowUpSummary;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const getCount = (key: string) => {
    switch (key) {
      case "total": return summary?.total || 0;
      case "done": return summary?.completed || 0;
      case "missed": return summary?.missed || 0;
      case "pending": return summary?.pending || 0;
      case "today": return 0; 
      default: return 0;
    }
  };

  return (
    <div className="flex gap-6 mb-8 mt-4 whitespace-nowrap overflow-x-auto pb-4">
      {STATS.map((stat) => {
        const isActive = activeTab === stat.key;
        return (
          <div
            key={stat.key}
            onClick={() => onTabChange(stat.key)}
            className="group relative pt-5 flex-1 min-w-[120px] cursor-pointer"
          >
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 rounded-[14px] flex items-center justify-center z-10 transition-colors shadow-sm ${
                isActive ? "bg-[#233A78] text-white" : "bg-[#233A78] text-white"
              }`}
            >
              <stat.icon />
            </div>
            <div
              className={`rounded-[24px] pt-8 pb-4 px-4 text-center border-2 transition-all duration-200 ${
                isActive
                  ? "bg-[#E6F0F9] border-[#233A78]"
                  : "bg-white/40 border-white hover:bg-white/60"
              }`}
            >
              <h3 className={`text-[24px] mb-1 leading-none ${isActive ? "text-[#233A78]" : "text-gray-800"}`}>
                {getCount(stat.key)}
              </h3>
              <p className={`text-[17px] ${isActive ? "text-[#233A78]" : "text-gray-800"}`}>
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UsersIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function ClockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function CheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
function PhoneMissedIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="23" y1="1" x2="17" y2="7"/><line x1="17" y1="1" x2="23" y2="7"/><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}
function UserClockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="11" r="5"/><polyline points="19 8 19 11 21 13"/></svg>
}
