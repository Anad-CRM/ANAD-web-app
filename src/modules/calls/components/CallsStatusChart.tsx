import React from "react";
import { CallAnalyticsResponse } from "../types";
import { Text } from "@/core/components/ui/Text";

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
    { label: "Connected", count: connectedCount, color: "#1E3A8A", percentage: getPercentage(connectedCount) },
    { label: "Incoming", count: incomingCount, color: "#3B82F6", percentage: getPercentage(incomingCount) },
    { label: "Missed", count: missedCount, color: "#60A5FA", percentage: getPercentage(missedCount) },
    { label: "Outgoing", count: outgoingCount, color: "#93C5FD", percentage: getPercentage(outgoingCount) },
  ];

  return (
    <div className="flex flex-col w-full h-full sm:pl-4 font-sans">
      <Text as="h3" weight="semibold" className="text-slate-800 mb-6" style={{ fontSize: '16px' }}>Calls Status</Text>
      
      <div className="relative w-full h-[240px] flex flex-col justify-end border-b-2 border-slate-300 border-l-2 border-l-slate-300 ml-4 pl-8 pr-8 pt-4 pb-0 mb-8">
            
        <div className="w-full h-full flex items-end justify-between">
            {stats.map((stat, idx) => (
                <div key={idx} className="relative flex flex-col items-center justify-end w-12 h-full">
                    {stat.percentage > 0 && (
                      <div 
                          className="w-10 rounded-t-lg flex items-end justify-center pb-3 transition-all duration-700 shadow-md transform hover:scale-x-110" 
                          style={{ backgroundColor: stat.color, height: `${stat.percentage}%` }}
                      >
                          <Text weight="bold" className="transform -rotate-90 text-white tracking-tighter" size="custom" style={{ fontSize: '12px' }}>{stat.percentage}%</Text>
                      </div>
                    )}
                    {stat.percentage === 0 && (
                      <div className="w-10 h-[2px] bg-slate-200 rounded-t-lg" />
                    )}
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-full">
         {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: stat.color }} />
                  <Text weight="bold" className="text-slate-600" style={{ fontSize: '14px' }}>{stat.label}</Text>
              </div>
         ))}
      </div>
    </div>
  );
};
