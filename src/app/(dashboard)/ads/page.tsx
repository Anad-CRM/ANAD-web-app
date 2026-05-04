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

import Link from "next/link";
import { Text } from "@/core/components/ui/Text";

export default function AdsAnalyticsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [globalCounts, setGlobalCounts] = useState<{ total: number; closed: number } | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
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
        setTeamMembers(leadSummary.staffLeadCounts || []);
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
              <Text size="base">Loading analytics...</Text>
            </div>
          ) : (
            <>
              <GlobalMetrics data={globalMetrics} />
              
              <div className="flex justify-between items-center mt-6 mb-4">
                <Text as="h2" size="base" weight="bold" className="text-black font-extrabold">Top Performing Ad</Text>
                <Link href="/ads/all" className="flex items-center gap-1 hover:underline">
                  <Text size="sm" weight="bold" className="text-[#1E56A0]">View All</Text>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E56A0" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>

              <Link href={`/ads/${selectedCampaign?.adId || ''}`} className="block">
                <CampaignCard data={selectedCampaign || undefined} />
              </Link>

              <TeamPerformance data={{ totalSpend: "-", leads: globalMetrics.totalAssigned, avgCtr: "0%" }} teamMembers={teamMembers} />
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
