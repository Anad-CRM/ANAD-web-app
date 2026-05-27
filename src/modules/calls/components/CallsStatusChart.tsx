import React from "react";
import { CallAnalyticsResponse } from "../types";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

export const CallsStatusChart = ({ analytics }: { analytics: CallAnalyticsResponse | null }) => {
  const summary = analytics?.summary;
  const types = analytics?.callTypes;

  const total = summary?.totalCalls || 0;
 
  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const incomingCount = types?.incoming.count || 0;
  const outgoingCount = types?.outgoing.count || 0;
  const missedCount = types?.missed.count || 0;
  const connectedCount = incomingCount + outgoingCount;

  const stats = [
    { label: "Connected", count: connectedCount, color: COLORS.primaryDark, percentage: getPercentage(connectedCount) },
    { label: "Incoming", count: incomingCount, color: COLORS.info, percentage: getPercentage(incomingCount) },
    { label: "Missed", count: missedCount, color: COLORS.violet, percentage: getPercentage(missedCount) },
    { label: "Outgoing", count: outgoingCount, color: COLORS.primary, percentage: getPercentage(outgoingCount) },
  ];

  return (
    <div className="flex flex-col w-full h-full font-sans sm:pl-4">
      <Text as="h3" weight="semibold" className="mb-5 sm:mb-6" style={{ fontSize: '16px', color: COLORS.text }}>Calls Status</Text>
      
      <div className="relative w-full h-[220px] sm:h-[240px] flex flex-col justify-end border-b-2 border-l-2 ml-0 sm:ml-4 pl-4 sm:pl-8 pr-4 sm:pr-8 pt-4 pb-0 mb-6 sm:mb-8" style={{ borderColor: COLORS.border }}>
            
        <div className="w-full h-full flex items-end justify-between">
            {stats.map((stat, idx) => (
                <div key={idx} className="relative flex flex-col items-center justify-end w-12 h-full">
                    {stat.percentage > 0 && (
                      <div 
                          className="w-10 rounded-t-lg flex items-end justify-center pb-3 transition-all duration-700 shadow-md transform hover:scale-x-110" 
                          style={{ backgroundColor: stat.color, height: `${stat.percentage}%` }}
                      >
                          <Text weight="bold" className="transform -rotate-90 tracking-tighter" size="custom" style={{ fontSize: '12px', color: COLORS.bg }}>{stat.percentage}%</Text>
                      </div>
                    )}
                    {stat.percentage === 0 && (
                      <div className="w-10 h-[2px] bg-slate-200 rounded-t-lg" />
                    )}
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 max-w-full sm:gap-x-8">
         {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: stat.color }} />
                  <Text weight="bold" style={{ fontSize: '14px', color: COLORS.muted }}>{stat.label}</Text>
              </div>
         ))}
      </div>
    </div>
  );
};
