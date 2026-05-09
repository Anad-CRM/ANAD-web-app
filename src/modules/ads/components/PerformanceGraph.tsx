import React, { useEffect, useState } from "react";
import { getAdStatusBreakdown } from "../api/adsApi";
import { AdStatusCount } from "../types";
import { Text } from "@/core/components/ui/Text";
import { BarChart3 } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

export const PerformanceGraph = ({ adId }: { adId?: string }) => {
  const [statusData, setStatusData] = useState<AdStatusCount | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!adId) return;

    const fetchStatus = async () => {
      setIsLoading(true);
      const data = await getAdStatusBreakdown(adId);
      if (data) setStatusData(data.leadStatusCounts);
      setIsLoading(false);
    };
    fetchStatus();
  }, [adId]);

  const stats = [
    { label: "New", count: statusData?.newLeadCount || 0, color1: COLORS.info, color2: COLORS.primaryDark },
    { label: "Hot", count: statusData?.hotLeadCount || 0, color1: COLORS.warning, color2: COLORS.dark_orange },
    { label: "Closed", count: statusData?.closedLeadCount || 0, color1: COLORS.light_green, color2: COLORS.success },
    { label: "FollowUp", count: statusData?.followUpLeadCount || 0, color1: COLORS.violet, color2: "#3b336b" },
  ];

  const maxCount = Math.max(...stats.map(s => s.count), 1);

  return (
    <div className="flex flex-col w-full h-full max-h-[120px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primary }}>
          <BarChart3 className="w-5 h-5" />
        </div>
        <Text as="h2" size="lg" weight="bold" className="font-extrabold tracking-tight" style={{ color: COLORS.text }}>Status Breakdown</Text>
      </div>

      <div
        className="rounded-[24px] p-8 relative w-full flex-1 min-h-[360px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col justify-center"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full animate-pulse gap-3" style={{ color: COLORS.subtle }}>
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" style={{ borderTopColor: COLORS.primary }}></div>
            <Text size="sm">Analyzing performance...</Text>
          </div>
        ) : !adId ? (
          <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: COLORS.subtle }}>
            <BarChart3 className="w-12 h-12 opacity-50" />
            <Text size="sm">Select a campaign to see performance</Text>
          </div>
        ) : (
          <div className="absolute bottom-12 left-10 right-10 top-16 flex items-end justify-between border-b" style={{ borderBottomColor: COLORS.border }}>

            {/* Y Axis lines - Decorative */}
            <div className="absolute inset-0 flex flex-col justify-between -z-10 opacity-30">
              <div className="border-t border-dashed w-full" style={{ borderTopColor: COLORS.border }}></div>
              <div className="border-t border-dashed w-full" style={{ borderTopColor: COLORS.border }}></div>
              <div className="border-t border-dashed w-full" style={{ borderTopColor: COLORS.border }}></div>
              <div className="border-t border-dashed w-full" style={{ borderTopColor: COLORS.border }}></div>
            </div>

            {stats.map((stat, idx) => {
              const percentage = Math.max((stat.count / maxCount) * 100, 4); // min 4% height
              return (
                <div key={idx} className="relative flex flex-col items-center justify-end w-16 h-full group">

                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 px-3 py-1 rounded-lg pointer-events-none z-10 flex flex-col items-center" style={{ backgroundColor: COLORS.text, color: COLORS.surface }}>
                    <Text size="xs" weight="bold">{stat.count}</Text>
                    <div className="absolute -bottom-1 w-2 h-2 rotate-45" style={{ backgroundColor: COLORS.text }}></div>
                  </div>

                  {/* Bar */}
                  <div
                    className="w-12 rounded-t-xl transition-all duration-700 ease-out flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                    style={{
                      height: `${percentage}%`,
                      background: `linear-gradient(to top, ${stat.color2}, ${stat.color1})`
                    }}
                  >
                  </div>

                  {/* X Axis Label */}
                  <Text weight="semibold" className="absolute -bottom-8 whitespace-nowrap transition-colors" style={{ color: COLORS.muted, fontSize: '12px' }}>{stat.label}</Text>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
