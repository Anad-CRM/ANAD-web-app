"use client";

import React, { useEffect, useState } from "react";
import { AdsHeader } from "@/modules/ads/components/AdsHeader";
import { GlobalMetrics } from "@/modules/ads/components/GlobalMetrics";
import { CampaignCard } from "@/modules/ads/components/CampaignCard";
import { TeamPerformance } from "@/modules/ads/components/TeamPerformance";
import { PerformanceGraph } from "@/modules/ads/components/PerformanceGraph";
import { AdCampaign, GlobalAdMetrics, TeamPerformanceMetrics } from "@/modules/ads/types";

export default function AdsAnalyticsPage() {
  const [globalMetrics, setGlobalMetrics] = useState<GlobalAdMetrics | undefined>();
  const [campaignData, setCampaignData] = useState<AdCampaign | undefined>();
  const [teamMetrics, setTeamMetrics] = useState<TeamPerformanceMetrics | undefined>();

  useEffect(() => {
    
    setGlobalMetrics({
      totalAssigned: 165,
      totalClosed: 165,
      successRate: "2.4%",
    });

    setCampaignData({
      id: "c-1",
      name: "Athira Feedback Campaign 12.3.26",
      status: "Manual",
      metrics: {
        clicks: 20,
        impressions: 22,
        leads: 22,
        ctr: 22,
      },
    });

    setTeamMetrics({
      totalSpend: "-",
      leads: 450,
      avgCtr: "67%",
    });
  }, []);

  return (
    <div className="flex-1 w-full bg-white sm:bg-[#F1F5F9] min-h-screen p-6 overflow-y-auto font-sans">
      
      <AdsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8">
        
        <div className="flex flex-col w-full h-full max-w-[500px]">
          <GlobalMetrics data={globalMetrics} />
          <CampaignCard data={campaignData} />
          <TeamPerformance data={teamMetrics} />
        </div>

        <div className="flex flex-col w-full h-full">
          <PerformanceGraph />
        </div>

      </div>
    </div>
  );
}
