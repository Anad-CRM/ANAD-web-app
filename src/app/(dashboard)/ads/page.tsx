"use client";

import React, { useEffect, useState } from "react";
import { AdsHeader } from "@/modules/ads/components/AdsHeader";
import { GlobalMetrics } from "@/modules/ads/components/GlobalMetrics";
import { CampaignCard } from "@/modules/ads/components/CampaignCard";
import { TeamPerformance } from "@/modules/ads/components/TeamPerformance";
import { PerformanceGraph } from "@/modules/ads/components/PerformanceGraph";
import { AdCampaign, GlobalAdMetrics, TeamMemberPerformance } from "@/modules/ads/types";
import { getAllAds } from "@/modules/ads/api/adsApi";
import { getLeadSummary } from "@/modules/overview/api/overviewApi";

import Link from "next/link";
import { Text } from "@/core/components/ui/Text";
import { Sparkles } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

// ─── Skeleton primitives ──────────────────────────────────────────────────────

function Bone({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ backgroundColor: COLORS.grey, ...style }}
    />
  );
}

function MetricCardSkeleton() {
  return (
    <div
      className="border rounded-[20px] p-5 flex flex-col justify-between"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
    >
      <div className="flex justify-between items-start w-full mb-4">
        <Bone className="w-10 h-10 rounded-2xl" />
      </div>
      <Bone className="h-8 w-16 mb-2" />
      <Bone className="h-4 w-24" />
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <div
      className="rounded-[24px] overflow-hidden border shadow-sm"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
    >
      <Bone className="w-full h-36 rounded-none" />
      <div className="p-5 space-y-3">
        <Bone className="h-5 w-3/4" />
        <Bone className="h-4 w-1/2" />
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Bone className="h-3 w-full" />
              <Bone className="h-5 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GraphSkeleton() {
  return (
    <div
      className="rounded-[24px] p-6 border shadow-sm flex flex-col gap-4"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Bone className="w-9 h-9 rounded-xl" />
        <Bone className="h-5 w-32" />
      </div>
      <div className="flex items-end justify-between gap-4 h-40 pt-4">
        {[80, 55, 95, 40].map((h, i) => (
          <Bone key={i} className="flex-1 rounded-t-xl rounded-b-none" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function TeamMemberSkeleton() {
  return (
    <div
      className="flex items-center p-4 gap-4"
      style={{ borderBottom: `1px solid ${COLORS.bg}` }}
    >
      <Bone className="w-12 h-12 rounded-2xl flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <Bone className="h-4 w-32" />
        <Bone className="h-3 w-48" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <Bone className="h-6 w-12" />
        <Bone className="h-3 w-16" />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <MetricCardSkeleton key={i} />)}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <CampaignCardSkeleton />
        <GraphSkeleton />
      </div>

      {/* Team section */}
      <div
        className="rounded-[24px] border overflow-hidden shadow-sm"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
      >
        <div className="p-5 flex items-center gap-2" style={{ borderBottom: `1px solid ${COLORS.bg}` }}>
          <Bone className="w-9 h-9 rounded-xl" />
          <Bone className="h-5 w-36" />
        </div>
        {[1, 2, 3].map((i) => <TeamMemberSkeleton key={i} />)}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdsAnalyticsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [globalCounts, setGlobalCounts] = useState<{ total: number; closed: number } | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [adsData, leadSummary] = await Promise.all([
        getAllAds(),
        getLeadSummary()
      ]);

      setCampaigns(adsData);
      if (adsData.length > 0) setSelectedCampaign(adsData[0]);

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
    successRate: globalCounts?.total
      ? ((globalCounts.closed / globalCounts.total) * 100).toFixed(1) + "%"
      : "0%",
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <AdsHeader />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8">

          {/* Global KPI Metrics */}
          <GlobalMetrics data={globalMetrics} />

          {/* Top Ad + Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

            {/* Left: Campaign Card */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: "#FEF3C7", color: COLORS.warning }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <Text
                    as="h2"
                    size="base"
                    weight="bold"
                    className="font-extrabold tracking-tight"
                    style={{ color: COLORS.text }}
                  >
                    Top Performing Ad
                  </Text>
                </div>
                <Link
                  href="/ads/all"
                  className="flex items-center gap-1.5 hover:opacity-70 transition-opacity border px-3 py-1.5 rounded-full shadow-sm"
                  style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
                >
                   <Text weight="bold" style={{ color: COLORS.text, fontSize: '12px' }}>
                    View All Ads
                   </Text>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ color: COLORS.muted }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>

              <Link href={`/ads/${selectedCampaign?.adId || ""}`} className="block w-full">
                <CampaignCard data={selectedCampaign || undefined} />
              </Link>
            </div>

            {/* Right: Performance chart */}
            <div className="flex flex-col h-full">
              <PerformanceGraph adId={selectedCampaign?.adId} adRecordId={selectedCampaign?.id} />
            </div>

          </div>

          {/* Team Performance */}
          <TeamPerformance
            data={{ totalSpend: "-", leads: globalMetrics.totalAssigned, avgCtr: "0%" }}
            teamMembers={teamMembers}
          />
          
        </div>
      )}
    </div>
  );
}
