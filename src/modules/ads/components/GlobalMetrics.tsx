import React from "react";
import { GlobalAdMetrics } from "../types";

export const GlobalMetrics = ({ data }: { data?: GlobalAdMetrics }) => {
  return (
    <div className="bg-[#EAEFF5] rounded-3xl p-5 mb-8 flex items-center justify-between shadow-[inset_0px_2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex-1 flex flex-col items-center">
            <span className="text-[12px] text-gray-700 font-semibold mb-1">Total Assigned</span>
            <span className="text-[16px] font-bold text-black">{data?.totalAssigned || "0"}</span>
        </div>
        <div className="w-[1px] h-8 bg-gray-300/60 shadow-sm" />
        <div className="flex-1 flex flex-col items-center">
            <span className="text-[12px] text-gray-700 font-semibold mb-1">Total Closed</span>
            <span className="text-[16px] font-bold text-black">{data?.totalClosed || "0"}</span>
        </div>
        <div className="w-[1px] h-8 bg-gray-300/60 shadow-sm" />
        <div className="flex-1 flex flex-col items-center">
            <span className="text-[12px] text-gray-700 font-semibold mb-1">Success Rate</span>
            <span className="text-[16px] font-bold text-black">{data?.successRate || "0%"}</span>
        </div>
    </div>
  );
};
