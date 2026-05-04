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
import { Sparkles } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

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
    <div className="flex flex-col w-full max-w-[1600px] mx-auto min-h-screen">

      <AdsHeader />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4" style={{ color: COLORS.subtle }}>
          <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: COLORS.border, borderTopColor: COLORS.primary }}></div>
          <Text size="base" weight="medium">Loading your analytics...</Text>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* Global KPI Metrics — full width */}
          <GlobalMetrics data={globalMetrics} />

          {/* Main two-column section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

            {/* Left: Top Ad card */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: COLORS.warning }}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <Text as="h2" size="base" weight="bold" className="font-extrabold tracking-tight" style={{ color: COLORS.text }}>Top Performing Ad</Text>
                </div>
                <Link
                  href="/ads/all"
                  className="flex items-center gap-1.5 hover:opacity-70 transition-opacity border px-3 py-1.5 rounded-full shadow-sm"
                  style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
                >
                  <Text size="xs" weight="bold" style={{ color: COLORS.text }}>View All Ads</Text>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: COLORS.muted }}><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </div>

              <Link href={`/ads/${selectedCampaign?.adId || ''}`} className="block w-full">
                <CampaignCard data={selectedCampaign || undefined} />
              </Link>
            </div>

            {/* Right: Status Breakdown chart — fills same height naturally */}
            <div className="flex flex-col h-full">
              <PerformanceGraph adId={selectedCampaign?.adId} />
            </div>

          </div>

          {/* Full-width Team Performance section below */}
          <TeamPerformance
            data={{ totalSpend: "-", leads: globalMetrics.totalAssigned, avgCtr: "0%" }}
            teamMembers={teamMembers}
          />

        </div>
      )}
    </div>
  );
}
