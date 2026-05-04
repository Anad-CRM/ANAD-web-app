import React, { useState } from "react";
import { TeamPerformanceMetrics } from "../types";
import { Text } from "@/core/components/ui/Text";
import { Users, ChevronDown, ChevronUp } from "lucide-react";

interface TeamPerformanceProps {
  data?: TeamPerformanceMetrics;
  teamMembers?: any[];
}

export const TeamPerformance = ({ data, teamMembers = [] }: TeamPerformanceProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedMembers = [...teamMembers].sort((a, b) => {
    const rateA = a.assignedCount ? (a.closedCount || 0) / a.assignedCount : 0;
    const rateB = b.assignedCount ? (b.closedCount || 0) / b.assignedCount : 0;
    return rateB - rateA;
  });

  const displayedMembers = isExpanded ? sortedMembers : sortedMembers.slice(0, 5);

  return (
    <div className="w-full flex flex-col items-center mb-8 gap-6">
        
        {/* Existing Performance Stats Block */}
        <div className="w-full max-w-[500px]">
            <Text as="h2" size="base" weight="bold" className="text-black font-extrabold mb-3 block">Team Overview</Text>
            <div className="bg-[#EAEFF5] rounded-3xl p-4">
                <div className="bg-[#233A78] rounded-3xl p-5 w-full flex items-center justify-around shadow-sm text-white">
                    <div className="flex flex-col items-center">
                        <Text as="span" size="xs" weight="semibold" className="opacity-90 mb-1 block">Total Spend</Text>
                        <Text as="span" size="sm" weight="medium" className="block">{data?.totalSpend || "-"}</Text>
                    </div>
                    <div className="flex flex-col items-center">
                        <Text as="span" size="xs" weight="semibold" className="opacity-90 mb-1 block">Leads</Text>
                        <Text as="span" size="sm" weight="medium" className="block">{data?.leads || "450"}</Text>
                    </div>
                    <div className="flex flex-col items-center">
                        <Text as="span" size="xs" weight="semibold" className="opacity-90 mb-1 block">Avg CTR</Text>
                        <Text as="span" size="sm" weight="medium" className="block">{data?.avgCtr || "67%"}</Text>
                    </div>
                </div>
            </div>
        </div>

        {/* Team Members List (From Flutter) */}
        <div className="w-full max-w-[500px]">
          <Text as="h2" size="base" weight="bold" className="text-black font-extrabold mb-3 block">Team Performance</Text>
          {sortedMembers.length === 0 ? (
            <div className="w-full py-10 bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center border border-gray-100">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <Text size="sm" weight="medium" className="text-gray-500">No team performance data</Text>
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {displayedMembers.map((member, idx) => {
                  const assigned = member.assignedCount || 0;
                  const closed = member.closedCount || 0;
                  const completionRate = assigned ? (closed / assigned) * 100 : 0;
                  
                  return (
                    <div key={member.userId || idx} className={`flex items-center p-4 ${idx !== displayedMembers.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div className="w-12 h-12 rounded-full bg-[#EAEFF5] text-[#233A78] flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {member.userName ? member.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col ml-4 flex-1 min-w-0">
                        <Text size="sm" weight="bold" className="text-gray-900 mb-0.5 truncate block">{member.userName || 'Unknown User'}</Text>
                        <div className="flex gap-3">
                          <Text as="span" size="xs" className="text-gray-500 font-medium block">
                            Assigned: <span className="font-bold text-gray-700">{assigned}</span>
                          </Text>
                          <Text as="span" size="xs" className="text-gray-500 font-medium block">
                            Closed: <span className="font-bold text-gray-700">{closed}</span>
                          </Text>
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        <Text size="base" weight="bold" className="text-[#233A78] block">{completionRate.toFixed(1)}%</Text>
                        <Text size="xs" className="text-gray-500 block">completion</Text>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {sortedMembers.length > 5 && (
                <div 
                  className="flex items-center justify-center gap-1 mt-4 cursor-pointer text-[#233A78] hover:opacity-80 transition-opacity"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <Text size="sm" weight="bold" className="block">{isExpanded ? "View Less" : `View All ${sortedMembers.length} Members`}</Text>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              )}
            </div>
          )}
        </div>
        
    </div>
  );
};
