import React from "react";
import { TeamPerformanceMetrics } from "../types";

export const TeamPerformance = ({ data }: { data?: TeamPerformanceMetrics }) => {
  return (
    <div className="w-full flex justify-center mb-8">
        <div className="w-full max-w-[380px]">
            <h2 className="text-[15px] font-extrabold text-black mb-3">Team Performance</h2>
            <div className="bg-[#EAEFF5] rounded-3xl p-4">
                <div className="bg-[#233A78] rounded-3xl p-5 w-full flex items-center justify-around shadow-sm text-white">
                    
                    <div className="flex flex-col items-center">
                        <span className="text-[11px] font-semibold opacity-90 mb-1">Total Spend</span>
                        <span className="text-[14px] font-medium">{data?.totalSpend || "-"}</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-[11px] font-semibold opacity-90 mb-1">Leads</span>
                        <span className="text-[14px] font-medium">{data?.leads || "450"}</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-[11px] font-semibold opacity-90 mb-1">Avg CTR</span>
                        <span className="text-[14px] font-medium">{data?.avgCtr || "67%"}</span>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};
