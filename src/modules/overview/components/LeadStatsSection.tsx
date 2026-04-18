import React from "react";
import { LeadCountsData } from "../types";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

interface LeadStatsSectionProps {
  data: LeadCountsData | null;
  filter?: string;
  onFilterChange?: (val: string) => void;
}

export default function LeadStatsSection({ data, filter, onFilterChange }: LeadStatsSectionProps) {
  const counts = data?.statusCounts;

  const statItems = [
    { label: "New Lead", count: counts?.newLead || 0, color: COLORS.primaryDark },
    { label: "Hot Lead", count: counts?.hotLead || 0, color: COLORS.primary },
    { label: "Follow Up", count: counts?.followUp || 0, color: "#64748B" },
    { label: "Registered", count: counts?.registered || 0, color: COLORS.accent },
    { label: "Enrolled", count: counts?.closed || 0, color: "#F1F5F9" },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Text size="custom" weight="bold" className="text-[18px] text-black">
          Leads Summary
        </Text>

        <div className="flex items-center">
          <div className="bg-white px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm border border-[#E2E8F0] hover:bg-gray-50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#233A78]"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
            <select 
              className="bg-transparent text-[14px] text-[#233A78] font-bold outline-none cursor-pointer appearance-none pr-4"
              value={filter || "Overall"}
              onChange={(e) => onFilterChange?.(e.target.value)}
            >
              <option value="Overall">Overall</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Custom">Custom Filter</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-stretch min-h-[180px]">
        <div className="flex-1 max-w-[400px] bg-white border border-[#E2E8F0] rounded-4xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] h-full flex items-center justify-center gap-8">
          <div className="relative w-[120px] h-[120px] rounded-full border-[18px] border-r-transparent border-[#233A78] flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-[-18px] rounded-full border-[18px] border-t-transparent border-l-transparent border-b-[#A5BCD1] border-r-[#A5BCD1] rotate-45" />
            <div className="absolute inset-[-18px] top-auto h-[18px] rounded-b-full overflow-hidden">
              <div className="w-full h-full bg-[#E2E8F0]" />
            </div>
            <div
              className="text-center z-10 flex flex-col items-center justify-center w-[76px] h-[76px] rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-50"
              style={{ backgroundColor: COLORS.grey }}
            >
              <Text size="custom" weight="bold" className="text-[20px] font-extrabold text-black leading-none">{data?.totalLeads || 0}</Text>
              <Text size="custom" className="text-[10px] text-black whitespace-nowrap leading-none mt-1">Total leads</Text>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {statItems.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: stat.color }} />
                <Text size="custom" className="text-[13px] text-gray-700 flex-1 whitespace-nowrap">{stat.label}</Text>
                <Text size="custom" weight="bold" className="text-[14px] text-black w-6 text-right flex-shrink-0">{stat.count}</Text>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 h-full">
          <div className="w-[180px] bg-[#D6E4F0] rounded-2xl p-6 flex flex-col justify-center items-center shadow-sm">
            <Text size="custom" weight="bold" className="text-[14px] text-black self-start mb-2">All Leads</Text>
            <div className="flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-[#233A78]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              <Text size="custom" weight="bold" className="text-[36px] font-extrabold text-black leading-none">{data?.totalLeads || 0}</Text>
            </div>
          </div>

          <div className="w-[180px] bg-[#D6E4F0] rounded-2xl p-6 flex flex-col justify-center items-center shadow-sm">
            <Text size="custom" weight="bold" className="text-[14px] text-black self-start mb-2">Unassigned</Text>
            <div className="flex items-center gap-3">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#233A78]"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              <Text size="custom" weight="bold" className="text-[36px] font-extrabold text-black leading-none">{data?.unAssignedCount || 0}</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
