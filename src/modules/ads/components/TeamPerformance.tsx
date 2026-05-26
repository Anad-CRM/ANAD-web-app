import React, { useState } from "react";
import { TeamPerformanceMetrics, TeamMemberPerformance } from "../types";
import { Text } from "@/core/components/ui/Text";
import { Users, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

interface TeamPerformanceProps {
  data?: TeamPerformanceMetrics;
  teamMembers?: TeamMemberPerformance[];
}



function getInitialColor(index: number): string {
  const palette = [
    COLORS.primary,
    COLORS.violet,
    COLORS.success,
    COLORS.warning,
    COLORS.info,
    COLORS.dark_orange,
    COLORS.anccent_green,
  ];
  return palette[index % palette.length];
}

export const TeamPerformance = ({ teamMembers = [] }: TeamPerformanceProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedMembers = [...teamMembers].sort((a, b) => {
    const rateA = a.assignedCount ? (a.closedCount || 0) / a.assignedCount : 0;
    const rateB = b.assignedCount ? (b.closedCount || 0) / b.assignedCount : 0;
    return rateB - rateA;
  });

  const displayedMembers = isExpanded ? sortedMembers : sortedMembers.slice(0, 5);

  return (
    <div className="w-full flex flex-col gap-4 mb-4">
      {/* Section header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primary }}>
            <Users className="w-5 h-5" />
          </div>
          <Text as="h2" size="lg" weight="bold" className="font-extrabold tracking-tight" style={{ color: COLORS.text }}>
            Team Performance
          </Text>
          {sortedMembers.length > 0 && (
            <div
              className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: COLORS.primary }}
            >
              {sortedMembers.length}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 self-start sm:self-auto" style={{ color: COLORS.subtle }}>
          <TrendingUp className="w-3.5 h-3.5" />
          <Text weight="semibold" style={{ fontSize: '12px' }}>Sorted by completion</Text>
        </div>
      </div>

      {/* Empty state */}
      {sortedMembers.length === 0 ? (
        <div
          className="w-full py-14 rounded-[22px] flex flex-col items-center gap-3 border"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: COLORS.bg }}
          >
            <Users className="w-7 h-7" style={{ color: COLORS.subtle }} />
          </div>
          <Text size="sm" weight="medium" style={{ color: COLORS.muted }}>
            No team performance data available
          </Text>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Member list */}
          <div
            className="rounded-[22px] border overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
          >
            {displayedMembers.map((member, idx) => {
              const assigned = member.assignedCount || 0;
              const closed = member.closedCount || 0;
              const completionRate = assigned ? (closed / assigned) * 100 : 0;
              const isHigh = completionRate >= 50;
              const color = getInitialColor(idx);

              return (
                <div
                  key={member.userId || idx}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50/60 transition-colors sm:gap-4 sm:px-5"
                  style={{
                    borderBottom:
                      idx !== displayedMembers.length - 1
                        ? `1px solid ${COLORS.bg}`
                        : "none",
                  }}
                >
                  {/* Rank + avatar */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Text size="xs" weight="bold" style={{ color: COLORS.subtle, minWidth: 16, textAlign: "center" }}>
                      {idx + 1}
                    </Text>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      {member.userName ? member.userName.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <Text
                      size="sm"
                      weight="bold"
                      className="truncate block mb-1"
                      style={{ color: COLORS.text }}
                    >
                      {member.userName || "Unknown User"}
                    </Text>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: COLORS.bg }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(completionRate, 100)}%`,
                            backgroundColor: isHigh ? COLORS.success : COLORS.info,
                          }}
                        />
                      </div>
                      <Text size="xs" style={{ color: COLORS.subtle, flexShrink: 0 }}>
                        {closed}/{assigned}
                      </Text>
                    </div>
                  </div>

                  {/* Completion rate */}
                  <div
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl"
                    style={{
                      backgroundColor: isHigh ? "#DCFCE7" : "#DBEAFE",
                    }}
                  >
                    <Text weight="bold" style={{ fontSize: '12px', color: isHigh ? COLORS.success : COLORS.info }}>
                      {completionRate.toFixed(0)}%
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more / less */}
          {sortedMembers.length > 5 && (
            <button
              className="flex items-center justify-center gap-2 mt-4 py-2.5 px-5 border rounded-xl cursor-pointer transition-all shadow-sm w-fit self-center hover:shadow-md"
              style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.grey,
                color: COLORS.text,
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Text size="sm" weight="semibold" className="block">
                {isExpanded ? "Show Less" : `View All ${sortedMembers.length} Members`}
              </Text>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 opacity-50" />
              ) : (
                <ChevronDown className="w-4 h-4 opacity-50" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
