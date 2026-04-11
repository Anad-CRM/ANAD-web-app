import React from "react";
import { CallAnalyticsResponse } from "../types";

export const CallsStatusChart = ({ analytics }: { analytics: CallAnalyticsResponse | null }) => {
  const summary = analytics?.summary;
  const types = analytics?.callTypes;

  const total = summary?.totalCalls || 0;
  const connectedCount = (types?.incoming.count || 0) + (types?.outgoing.count || 0);
  const incomingCount = types?.incoming.count || 0;
  const missedCount = types?.missed.count || 0;
  const outgoingCount = types?.outgoing.count || 0;

  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const stats = [
    { label: "Connected", count: connectedCount, color: "#233A78", percentage: getPercentage(connectedCount) },
    { label: "Incoming", count: incomingCount, color: "#325A9E", percentage: getPercentage(incomingCount) },
    { label: "Missed", count: missedCount, color: "#5387D1", percentage: getPercentage(missedCount) },
    { label: "Outgoing", count: outgoingCount, color: "#6E9DF0", percentage: getPercentage(outgoingCount) },
  ];

  return (
    <div className="flex flex-col w-full h-full pl-0 sm:pl-8">
      <h3 className="text-[14px] font-medium text-black mb-3">Calls Status</h3>
      
      <div className="relative w-full h-[220px] flex flex-col justify-end border-b-2 border-black border-l-2 pl-6 pr-6 pt-4 pb-0 mb-6 font-sans">
            
        <div className="w-full h-full flex items-end justify-between px-4">
            {stats.map((stat, idx) => (
                <div key={idx} className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                    <div 
                        className="w-10 flex items-end justify-center pb-2 transition-all duration-500" 
                        style={{ backgroundColor: stat.color, height: `${stat.percentage}%`, minHeight: stat.percentage > 0 ? '20px' : '2px' }}
                    >
                        <span className="transform -rotate-90 text-[11px] font-bold">{stat.percentage}%</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-4 max-w-[280px]">
         {stats.map((stat, idx) => (
             <div key={idx} className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                 <span className="text-[14px] text-gray-800">{stat.label}</span>
             </div>
         ))}
      </div>
    </div>
  );
};
