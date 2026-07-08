import React, { useState } from "react";
import { CallAnalyticsResponse } from "../types";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

export const CallsStatusChart = ({ analytics }: { analytics: CallAnalyticsResponse | null }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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

  // Grid background lines (4 horizontal lines)
  const gridLines = [100, 75, 50, 25];

  return (
    <div className="flex flex-col w-full h-full font-sans sm:pl-4">
      {/* Header */}
      <Text as="h3" weight="semibold" className="mb-5 sm:mb-6" style={{ fontSize: '16px', color: COLORS.text }}>
        Calls Status
      </Text>

      {/* Chart Card */}
      <div
        className="relative w-full rounded-[28px] overflow-hidden mb-6 flex-1 flex flex-col pt-8 pb-4"
        style={{
          background: "linear-gradient(145deg, #e8f2fb 0%, #d0e4f6 40%, #c4d9f0 100%)",
          boxShadow: "inset 0 2px 8px rgba(30,86,160,0.08), 0 4px 24px rgba(30,86,160,0.10)",
          minHeight: "280px"
        }}
      >
        {/* Decorative background blobs */}
        <div className="absolute top-[-30px] right-[-20px] w-32 h-32 rounded-full opacity-10 pointer-events-none"
             style={{ background: `radial-gradient(circle, ${COLORS.primaryDark} 0%, transparent 70%)` }} />
        <div className="absolute bottom-10 left-[-20px] w-24 h-24 rounded-full opacity-[0.05] pointer-events-none"
             style={{ background: `radial-gradient(circle, ${COLORS.info} 0%, transparent 70%)` }} />

        {/* Chart Area */}
        <div className="relative flex-1 w-full flex items-end justify-between px-6 sm:px-12 z-10">
          
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-8 pointer-events-none px-4 sm:px-8">
            {gridLines.map((percent, i) => (
              <div key={i} className="w-full flex items-center h-0">
                <div className="w-full border-t border-dashed" style={{ borderColor: "rgba(30,86,160,0.15)" }} />
              </div>
            ))}
            {/* Baseline */}
            <div className="w-full border-t" style={{ borderColor: "rgba(30,86,160,0.3)" }} />
          </div>

          {/* Columns */}
          {stats.map((stat, idx) => {
            const isHovered = hoveredIdx === idx;
            const barHeight = stat.percentage > 0 ? `${stat.percentage}%` : '4px';

            return (
              <div
                key={idx}
                className="relative flex flex-col items-center justify-end w-12 sm:w-14 h-full pb-8 group"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip on hover */}
                <div 
                  className={`absolute bottom-full mb-2 flex flex-col items-center transition-all duration-200 pointer-events-none z-20 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                  style={{ left: "50%", transform: "translateX(-50%)" }}
                >
                  <div className="bg-[#163172] text-white text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg">
                    {stat.count} calls
                  </div>
                  {/* Tooltip arrow */}
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent" style={{ borderTopColor: "#163172" }} />
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t-xl transition-all duration-500 ease-out flex items-start justify-center pt-2 relative overflow-hidden"
                  style={{
                    height: barHeight,
                    backgroundColor: stat.color,
                    boxShadow: isHovered 
                      ? `0 0 16px ${stat.color}66, inset 0 2px 4px rgba(255,255,255,0.4)` 
                      : `inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.1)`,
                    transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                    transformOrigin: 'bottom'
                  }}
                >
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                  {/* Percentage text inside bar (only if tall enough) */}
                  {stat.percentage > 15 && (
                    <Text 
                      weight="bold" 
                      className="text-white z-10 transition-transform duration-300"
                      style={{ fontSize: '11px', textShadow: "0 1px 2px rgba(0,0,0,0.3)", transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                    >
                      {stat.percentage}%
                    </Text>
                  )}
                </div>

                {/* Bottom label / value for tiny bars */}
                <div className="absolute bottom-1 w-full text-center flex flex-col">
                  {stat.percentage <= 15 && stat.percentage > 0 && (
                     <Text weight="bold" className="mb-1" style={{ fontSize: '10px', color: COLORS.primaryDark }}>
                        {stat.percentage}%
                     </Text>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3 px-2">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-2.5 p-1.5 rounded-lg transition-colors cursor-default"
            style={{ backgroundColor: hoveredIdx === idx ? 'rgba(30,86,160,0.06)' : 'transparent' }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div 
              className="w-3.5 h-3.5 rounded-[4px] shadow-sm relative overflow-hidden" 
              style={{ backgroundColor: stat.color }}
            >
               <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
            </div>
            <div className="flex flex-col">
              <Text weight="bold" style={{ fontSize: '12px', color: hoveredIdx === idx ? COLORS.text : COLORS.muted, transition: 'color 0.2s' }}>
                {stat.label}
              </Text>
              <Text weight="semibold" style={{ fontSize: '10px', color: COLORS.subtle }}>
                {stat.count} ({stat.percentage}%)
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
