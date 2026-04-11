import React from "react";
import { CallFilterType, CallAnalyticsResponse } from "../types";

export const CallTypeFilters = ({ 
    activeFilter, 
    onFilterChange,
    analytics
}: { 
    activeFilter: CallFilterType, 
    onFilterChange: (type: CallFilterType) => void,
    analytics: CallAnalyticsResponse | null
}) => {
  const summary = analytics?.summary;
  const types = analytics?.callTypes;

  const getCount = (type: CallFilterType) => {
    if (!analytics) return 0;
    switch(type) {
      case "Total": return summary?.totalCalls || 0;
      case "Incoming": return types?.incoming.count || 0;
      case "Outgoing": return types?.outgoing.count || 0;
      case "Missed": return types?.missed.count || 0;
      case "Connected": return (types?.incoming.count || 0) + (types?.outgoing.count || 0);
      default: return 0;
    }
  };

  const filters: { type: CallFilterType, icon: React.ReactNode }[] = [
    {
        type: "Total",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    {
        type: "Incoming",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><polyline points="16 2 16 8 22 8"/><line x1="22" y1="2" x2="16" y2="8"/></svg>
    },
    {
        type: "Outgoing",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><polyline points="22 2 16 2 16 8"/><line x1="16" y1="2" x2="22" y2="8"/></svg>
    },
    {
        type: "Missed",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><line x1="22" y1="8" x2="16" y2="2"/><line x1="16" y1="8" x2="22" y2="2"/></svg>
    },
    {
        type: "Connected",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    }
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-8 font-sans">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.type;
        return (
          <button
            key={filter.type}
            onClick={() => onFilterChange(filter.type)}
            className={`flex flex-1 min-w-[140px] items-center gap-3 px-2 py-2 rounded-2xl transition-all ${
              isActive ? "bg-[#7198C5] shadow-sm transform scale-[1.02]" : "bg-[#7AA0CA] hover:bg-[#7198C5]"
            }`}
          >
            <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7AA0CA] shadow-sm`}>
                {filter.icon}
            </div>
            <div className="flex flex-col items-start pr-4">
               <span className="text-white text-[15px] font-medium leading-none mb-1">{filter.type}</span>
               <span className="text-white text-[12px] opacity-90 font-bold">{getCount(filter.type)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
