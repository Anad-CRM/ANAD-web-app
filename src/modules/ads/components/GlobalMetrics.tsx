import React from "react";
import { GlobalAdMetrics } from "../types";
import { Text } from "@/core/components/ui/Text";
import { Target, CheckCircle2, TrendingUp } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

export const GlobalMetrics = ({ data }: { data?: GlobalAdMetrics }) => {
  const metrics = [
    {
      label: "Total Assigned",
      value: data?.totalAssigned || "0",
      icon: <Target className="w-5 h-5" style={{ color: COLORS.primary }} />,
      bg: COLORS.primaryXlight,
      borderColor: COLORS.border,
    },
    {
      label: "Total Closed",
      value: data?.totalClosed || "0",
      icon: <CheckCircle2 className="w-5 h-5" style={{ color: COLORS.success }} />,
      bg: "#F0FDF4", // Lighter success bg
      borderColor: "#DCFCE7",
    },
    {
      label: "Success Rate",
      value: data?.successRate || "0%",
      icon: <TrendingUp className="w-5 h-5" style={{ color: COLORS.info }} />,
      bg: "#EFF6FF", // Lighter info bg
      borderColor: "#DBEAFE",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="border rounded-[20px] p-5 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300"
          style={{ backgroundColor: m.bg, borderColor: m.borderColor }}
        >
          <div className="flex justify-between items-start w-full mb-3">
            <div className="p-2.5 rounded-2xl shadow-sm bg-white">
              {m.icon}
            </div>
          </div>
          <div className="flex flex-col">
            <Text size="2xl" weight="bold" className="tracking-tight leading-none mb-1" style={{ color: COLORS.text }}>
              {m.value}
            </Text>
            <Text size="sm" weight="medium" style={{ color: COLORS.muted }}>
              {m.label}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
};
