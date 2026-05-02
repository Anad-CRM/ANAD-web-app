"use client";

import React, { useEffect, useState } from "react";
import { AdsHeader } from "@/modules/ads/components/AdsHeader";
import { GlobalMetrics } from "@/modules/ads/components/GlobalMetrics";
import { CampaignCard } from "@/modules/ads/components/CampaignCard";
import { TeamPerformance } from "@/modules/ads/components/TeamPerformance";
import { PerformanceGraph } from "@/modules/ads/components/PerformanceGraph";
import { AdCampaign, GlobalAdMetrics } from "@/modules/ads/types";
import { getAllAds } from "@/modules/ads/api/adsApi";
import { getLeadSummary } from "@/modules/overview/api/overviewApi";

export default function AdsAnalyticsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [globalCounts, setGlobalCounts] = useState<{ total: number; closed: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [adsData, leadSummary] = await Promise.all([
        getAllAds(),
        getLeadSummary()
      ]);

      setCampaigns(adsData);
      if (adsData.length > 0) {
        setSelectedCampaign(adsData[0]);
      }

      if (leadSummary) {
        setGlobalCounts({
          total: leadSummary.totalLeads,
          closed: leadSummary.statusCounts?.closed || 0
        });
      }

      setIsLoading(false);
    };
    fetchData();
  }, []);

  const globalMetrics: GlobalAdMetrics = {
    totalAssigned: globalCounts?.total || campaigns.reduce((acc, c) => acc + c.leadCount, 0),
    totalClosed: globalCounts?.closed || 0,
    successRate: globalCounts?.total ? ((globalCounts.closed / globalCounts.total) * 100).toFixed(1) + "%" : "0%",
  };

  return (
    <div className="flex flex-col gap-[22px]">
      
      <AdsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8">
        
        <div className="flex flex-col w-full h-full max-w-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-gray-400 animate-pulse">
              Loading analytics...
            </div>
          ) : (
            <>
              <GlobalMetrics data={globalMetrics} />
              <CampaignCard data={selectedCampaign || undefined} />
              <TeamPerformance data={{ totalSpend: "-", leads: globalMetrics.totalAssigned, avgCtr: "0%" }} />
            </>
          )}
        </div>

        <div className="flex flex-col w-full h-full">
          <PerformanceGraph adId={selectedCampaign?.adId} />
        </div>

      </div>
    </div>
  );
}
