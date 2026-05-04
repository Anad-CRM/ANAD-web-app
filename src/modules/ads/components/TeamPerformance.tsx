import React, { useState } from "react";
import { TeamPerformanceMetrics } from "../types";
import { Text } from "@/core/components/ui/Text";
import { Users, ChevronDown, ChevronUp, DollarSign, MousePointerClick, Percent } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

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
    <div className="w-full flex flex-col items-center mb-8 gap-8">
        
        {/* Team Overview Stats Block */}
        <div className="w-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primary }}>
                <Users className="w-5 h-5" />
              </div>
              <Text as="h2" size="lg" weight="bold" className="font-extrabold tracking-tight" style={{ color: COLORS.text }}>Team Overview</Text>
            </div>
            
            <div 
              className="rounded-[24px] p-6 w-full shadow-[0_8px_30px_rgba(30,86,160,0.2)] text-white relative overflow-hidden"
              style={{ background: `linear-gradient(to bottom right, ${COLORS.primaryDark}, ${COLORS.info})` }}
            >
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col items-start bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex-1 mr-3">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                           <DollarSign className="w-4 h-4" />
                           <Text as="span" size="xs" weight="semibold">Total Spend</Text>
                        </div>
                        <Text as="span" size="xl" weight="bold" className="tracking-tight">{data?.totalSpend || "-"}</Text>
                    </div>

                    <div className="flex flex-col items-start bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex-1 mr-3">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                           <MousePointerClick className="w-4 h-4" />
                           <Text as="span" size="xs" weight="semibold">Leads</Text>
                        </div>
                        <Text as="span" size="xl" weight="bold" className="tracking-tight">{data?.leads || "450"}</Text>
                    </div>

                    <div className="flex flex-col items-start bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex-1">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                           <Percent className="w-4 h-4" />
                           <Text as="span" size="xs" weight="semibold">Avg CTR</Text>
                        </div>
                        <Text as="span" size="xl" weight="bold" className="tracking-tight">{data?.avgCtr || "67%"}</Text>
                    </div>
                </div>
            </div>
        </div>

        {/* Team Members List */}
        <div className="w-full">
          <Text as="h2" size="base" weight="bold" className="font-extrabold mb-4 block tracking-tight" style={{ color: COLORS.text }}>Member Performance</Text>
          {sortedMembers.length === 0 ? (
            <div 
              className="w-full py-12 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center border"
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
            >
              <div className="p-5 rounded-full mb-4" style={{ backgroundColor: COLORS.bg }}>
                <Users className="w-8 h-8" style={{ color: COLORS.subtle }} />
              </div>
              <Text size="sm" weight="medium" style={{ color: COLORS.muted }}>No team performance data available</Text>
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div 
                className="rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border overflow-hidden"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
              >
                {displayedMembers.map((member, idx) => {
                  const assigned = member.assignedCount || 0;
                  const closed = member.closedCount || 0;
                  const completionRate = assigned ? (closed / assigned) * 100 : 0;
                  
                  return (
                    <div 
                      key={member.userId || idx} 
                      className="flex items-center p-5 transition-colors hover:bg-gray-50/50"
                      style={{ borderBottom: idx !== displayedMembers.length - 1 ? `1px solid ${COLORS.bg}` : 'none' }}
                    >
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm border"
                        style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primary, borderColor: COLORS.border }}
                      >
                        {member.userName ? member.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col ml-4 flex-1 min-w-0">
                        <Text size="sm" weight="bold" className="mb-1 truncate block" style={{ color: COLORS.text }}>{member.userName || 'Unknown User'}</Text>
                        <div className="flex gap-4">
                          <Text as="span" size="xs" className="font-medium flex items-center gap-1" style={{ color: COLORS.muted }}>
                            Assigned: <span className="font-bold px-1.5 py-0.5 rounded-md" style={{ color: COLORS.text, backgroundColor: COLORS.bg }}>{assigned}</span>
                          </Text>
                          <Text as="span" size="xs" className="font-medium flex items-center gap-1" style={{ color: COLORS.muted }}>
                            Closed: <span className="font-bold px-1.5 py-0.5 rounded-md" style={{ color: COLORS.success, backgroundColor: '#DCFCE7' }}>{closed}</span>
                          </Text>
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-4">
                        <div className="flex items-baseline gap-1">
                            <Text size="xl" weight="bold" style={{ color: completionRate >= 50 ? COLORS.success : COLORS.info }}>
                                {completionRate.toFixed(0)}
                            </Text>
                            <Text size="xs" weight="bold" style={{ color: completionRate >= 50 ? COLORS.success : COLORS.info }}>%</Text>
                        </div>
                        <Text size="xs" weight="medium" style={{ color: COLORS.subtle }}>completion</Text>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {sortedMembers.length > 5 && (
                <button 
                  className="flex items-center justify-center gap-2 mt-6 py-3 px-6 border rounded-xl cursor-pointer transition-all font-semibold shadow-sm w-fit self-center group"
                  style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <Text size="sm" weight="semibold" className="block">{isExpanded ? "Show Less" : `View All ${sortedMembers.length} Members`}</Text>
                  {isExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                </button>
              )}
            </div>
          )}
        </div>
        
    </div>
  );
};
