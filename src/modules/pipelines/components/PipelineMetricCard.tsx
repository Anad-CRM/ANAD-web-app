/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import * as Icons from "lucide-react";
import { PipelineMetric } from "../types";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

interface PipelineMetricCardProps {
  metric: PipelineMetric;
  onClick?: () => void;
}

export const PipelineMetricCard: React.FC<PipelineMetricCardProps> = ({ metric, onClick }) => {
  const IconComponent = ((Icons as Record<string, any>)[metric.iconName] || Icons.HelpCircle) as any;

  return (
    <div
      className="bg-white rounded-xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between shadow-sm border border-slate-100 h-full min-h-[118px] sm:min-h-[130px] cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start w-full">
        <Text
          as="h3"
          weight="medium"
          className="text-[13px] sm:text-[14px] leading-tight tracking-tight text-balance"
          style={{ color: COLORS.text }}
        >
          {metric.title}
          {metric.title === "RNR" && (
            <span
              className="block sm:inline text-[11px] sm:text-[11px] font-normal sm:ml-1 tracking-normal"
              style={{ color: COLORS.subtle }}
            >
              (Ring Not Respond)
            </span>
          )}
        </Text>
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: COLORS.primaryDark }}
        >
          <IconComponent className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-2">
        <Text
          as="span"
          weight="bold"
          className="text-[clamp(1.5rem,3.8vw,2.6rem)] leading-none"
          style={{ color: COLORS.text }}
        >
          {metric.count}
        </Text>
      </div>
    </div>
  );
};
