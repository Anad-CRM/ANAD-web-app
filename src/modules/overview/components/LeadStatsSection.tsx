import React from "react";
import { LeadCountsData } from "../types";

export default function LeadStatsSection({ data }: { data: LeadCountsData | null }) {
  const counts = data?.statusCounts;
  
  const statItems = [
    { label: "New Lead", count: counts?.newLead || 0, color: "bg-[#233A78]" },
    { label: "Hot Lead", count: counts?.hotLead || 0, color: "bg-[#4B73B2]" },
    { label: "Registered", count: counts?.registered || 0, color: "bg-[#93B0D6]" },
    { label: "Enrolled", count: counts?.closed || 0, color: "bg-[#F1F5F9]" },
  ];

  return (
    <div className="flex gap-4 mb-8 items-center h-[180px]">
      <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] h-full flex items-center justify-center gap-10">
        <div className="relative w-[120px] h-[120px] rounded-full border-[18px] border-r-transparent border-[#233A78] flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-[-18px] rounded-full border-[18px] border-t-transparent border-l-transparent border-b-[#A5BCD1] border-r-[#A5BCD1] rotate-45" />
          <div className="absolute inset-[-18px] top-auto h-[18px] rounded-b-full overflow-hidden">
             <div className="w-full h-full bg-[#E2E8F0]" />
          </div>
          
          <div className="text-center z-10 flex flex-col items-center">
            <span className="text-[20px] font-extrabold text-black leading-none">{data?.totalLeads || 0}</span>
            <span className="text-[10px] text-gray-500 whitespace-nowrap leading-none mt-1">Total leads</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {statItems.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full ${stat.color} shadow-sm`} />
              <span className="text-[13px] text-gray-700 w-20">{stat.label}</span>
              <span className="text-[13px] font-bold text-black w-8">{stat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 h-full">
        <div className="w-[180px] bg-[#D6E4F0] rounded-2xl p-6 flex flex-col justify-center items-center shadow-sm">
          <span className="text-[14px] font-bold text-black self-start mb-2">All Leads</span>
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-[#233A78]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span className="text-[36px] font-extrabold text-black leading-none">{data?.totalLeads || 0}</span>
          </div>
        </div>

        <div className="w-[180px] bg-[#D6E4F0] rounded-2xl p-6 flex flex-col justify-center items-center shadow-sm">
          <span className="text-[14px] font-bold text-black self-start mb-2">Unassigned</span>
          <div className="flex items-center gap-3">
             <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#233A78]"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span className="text-[36px] font-extrabold text-black leading-none">{data?.unAssignedCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
