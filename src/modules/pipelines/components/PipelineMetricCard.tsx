import React from "react";
import * as Icons from "lucide-react";
import { PipelineMetric } from "../types";

interface PipelineMetricCardProps {
  metric: PipelineMetric;
}

export const PipelineMetricCard: React.FC<PipelineMetricCardProps> = ({ metric }) => {
  const IconComponent = (Icons as any)[metric.iconName] || Icons.HelpCircle;

  return (
    <div className="bg-white rounded-xl p-4 lg:p-5 flex flex-col justify-between shadow-sm border border-slate-100 flex-1">
      <div className="flex justify-between items-start w-full">
        <h3 className="text-[#1A1A1A] text-[15px] font-medium tracking-tight">
          {metric.title}
          {metric.title === "RNR" && (
            <span className="text-[#8B8B8B] text-[11px] font-normal ml-1 tracking-normal">
              (Ring Not Respond)
            </span>
          )}
        </h3>
        <div className="w-8 h-8 rounded-lg bg-[#1C3A76] flex items-center justify-center shrink-0">
          <IconComponent className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold text-[#1A1A1A] leading-none">
          {metric.count}
        </span>
      </div>
    </div>
  );
};
