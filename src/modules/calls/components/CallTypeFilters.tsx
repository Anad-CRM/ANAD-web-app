import React from "react";
import { CallFilterType, CallAnalyticsResponse } from "../types";
import { Text } from "@/core/components/ui/Text";

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
      case "Rejected": return types?.rejected.count || 0;
      case "Personal": return types?.personalCalls.count || 0;
      case "New": return types?.newCalls.count || 0;
      case "NotPickedUp": return types?.notPickedUpCalls.count || 0;
      case "Connected": return (types?.incoming.count || 0) + (types?.outgoing.count || 0);
      default: return 0;
    }
  };

  const filters: { type: CallFilterType, icon: React.ReactNode, label?: string }[] = [
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
        type: "Rejected",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
    },
    {
        type: "Personal",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    {
        type: "New",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
    },
    {
        type: "NotPickedUp",
        label: "Not Picked",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
    },
    {
        type: "Connected",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.type;
        return (
          <button
            key={filter.type}
            onClick={() => onFilterChange(filter.type)}
            className={`bg-white border rounded-2xl p-4 flex flex-col items-center justify-center transition-all group relative ${
              isActive 
                ? "border-[#233A78] shadow-md ring-1 ring-[#233A78]/20 bg-[#F8FAFC]" 
                : "border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#A5BCD1]"
            }`}
          >
            <Text 
              weight="bold"
              size="custom"
              className={`leading-none mb-1.5 transition-transform group-hover:scale-110 inline-block ${
                isActive ? "text-[#233A78]" : "text-slate-800"
              }`}
              style={{ fontSize: '24px' }}
            >
              {getCount(filter.type)}
            </Text>
            <Text 
              weight="bold"
              size="custom"
              className={`text-center leading-tight uppercase tracking-wider ${
                isActive ? "text-[#233A78]" : "text-slate-500"
              }`}
              style={{ fontSize: '11px' }}
            >
              {filter.label || filter.type}
            </Text>
            {isActive && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#233A78]"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};
