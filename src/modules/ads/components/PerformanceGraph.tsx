import React, { useEffect, useState } from "react";
import { getAdStatusBreakdown } from "../api/adsApi";
import { AdStatusCount } from "../types";

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
    { label: "New", count: statusData?.newLeadCount || 0, color: "#233A78" },
    { label: "Hot", count: statusData?.hotLeadCount || 0, color: "#35539C" },
    { label: "Closed", count: statusData?.closedLeadCount || 0, color: "#4B73B2" },
    { label: "FollowUp", count: statusData?.followUpLeadCount || 0, color: "#5A8BE6" },
  ];

  const maxCount = Math.max(...stats.map(s => s.count), 1);

  return (
    <div className="flex flex-col w-full font-sans">
      <h2 className="text-[16px] font-extrabold text-black mb-3">Ad Performance (Leads)</h2>
      
      <div className="bg-[#EAEFF5] rounded-3xl p-6 relative w-full h-[300px] flex flex-col justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">Fetching status data...</div>
        ) : !adId ? (
          <div className="flex items-center justify-center h-full text-gray-400">Select a campaign to see performance</div>
        ) : (
          <div className="absolute bottom-10 left-8 right-8 top-16 flex items-end justify-between border-b-2 border-black border-l-2 pl-4 pr-2 pt-4">
              {stats.map((stat, idx) => {
                const percentage = Math.max((stat.count / maxCount) * 80, 5); // min 5% height for visibility
                return (
                  <div key={idx} className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                      <div 
                        className="w-10 flex items-end justify-center pb-2 transition-all duration-500" 
                        style={{ backgroundColor: stat.color, height: `${percentage}%` }}
                      >
                          <span className="transform -rotate-90 text-[11px] font-bold">{stat.count}</span>
                      </div>
                      <span className="absolute -bottom-7 text-black text-[11px] font-bold whitespace-nowrap">{stat.label}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
