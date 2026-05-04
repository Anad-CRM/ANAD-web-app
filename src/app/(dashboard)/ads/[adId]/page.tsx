"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdCampaign } from "@/modules/ads/types";
import { getAdById } from "@/modules/ads/api/adsApi";
import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { getUser } from "@/core/utils/auth";
import { ArrowLeft, } from "lucide-react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

export default function AdDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params.adId as string;

  const [adDetail, setAdDetail] = useState<AdCampaign | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("Overall");
  const [leadCounts, setLeadCounts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdData = async () => {
      setIsLoading(true);
      const ad = await getAdById(adId);
      setAdDetail(ad);
      await fetchLeadCounts("Overall");
      setIsLoading(false);
    };
    if (adId) fetchAdData();
  }, [adId]);

  const fetchLeadCounts = async (filter: string) => {
    try {
      const user = getUser<any>();
      const response = await api.post(API_ENDPOINTS.DASHBOARD.GET_FILTERED_LEAD_COUNT, {
        filter,
        organizationId: user?.organizationId,
        adId: adId
      });
      if (response.data?.status === 'success') {
        setLeadCounts(response.data.data.leadCounts);
      }
    } catch (error) {
      console.error("Failed to fetch lead counts", error);
    }
  };

  const handleFilterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filter = e.target.value;
    setSelectedFilter(filter);
    await fetchLeadCounts(filter);
  };

  const computeRate = (numerator?: number, denominator?: number) => {
    if (numerator == null || denominator == null || denominator === 0) return null;
    return ((numerator / denominator) * 100).toFixed(1);
  };

  const conversionRate = computeRate((leadCounts?.closedLeadCount || 0) + (leadCounts?.registerCount || 0), leadCounts?.allLeadsCount);
  const disqualifiedRate = computeRate(leadCounts?.disqualifiedCount, leadCounts?.allLeadsCount);

  if (isLoading) {
    return <div className="flex justify-center p-12 animate-pulse" style={{ color: COLORS.muted }}><Text>Loading ad details...</Text></div>;
  }

  if (!adDetail) {
    return <div className="p-12 text-center" style={{ color: COLORS.subtle }}><Text>Ad not found.</Text></div>;
  }

  const leadCards = [
    { title: "All Leads", value: leadCounts?.allLeadsCount, color: COLORS.primary, bg: COLORS.primaryXlight },
    { title: "New Leads", value: leadCounts?.newLeadCount, color: COLORS.success, bg: '#DCFCE7' },
    { title: "Follow Up", value: leadCounts?.followUpCount, color: COLORS.warning, bg: '#FEF3C7' },
    { title: "Hot Leads", value: leadCounts?.hotLeadCount, color: COLORS.dark_orange, bg: '#FFEDD5' },
    { title: "Closed", value: leadCounts?.closedLeadCount, color: COLORS.anccent_green, bg: '#CCFBF1' },
    { title: "Disqualified", value: leadCounts?.disqualifiedCount, color: COLORS.danger, bg: '#FEE2E2' },
    { title: "Contacted", value: leadCounts?.contactedLeadCount, color: COLORS.info, bg: '#DBEAFE' },
    { title: "RNR", value: leadCounts?.rnrCount, color: COLORS.muted, bg: '#F1F5F9' },
    { title: "Not Interested", value: leadCounts?.notInterestCount, color: COLORS.subtle, bg: '#F8FAFC' },
    { title: "Busy", value: leadCounts?.busyCount, color: COLORS.brown, bg: '#FFEDD5' },
    { title: "Switch Off", value: leadCounts?.switchOffCount, color: COLORS.violet, bg: '#F3E8FF' },
    { title: "Register", value: leadCounts?.registerCount, color: COLORS.light_green, bg: '#D1FAE5' },
  ];

  const getPlatformIcon = (platform: string) => {
    const initial = platform?.charAt(0) || "A";
    return <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm" style={{ backgroundColor: COLORS.primary }}>{initial}</div>;
  };

  return (
    <div className="flex flex-col p-4 w-full max-w-[1600px] mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors shadow-md flex-shrink-0 hover:opacity-80"
          style={{ backgroundColor: COLORS.primaryDark }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Text as="h1" size="2xl" weight="bold" style={{ color: COLORS.text }}>Ad Detail</Text>
      </div>

      {/* Ad Header */}
      <div className="rounded-3xl p-6 shadow-sm border mb-8" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}>
        <div className="flex items-center gap-6 mb-6">
          {adDetail.thumbnailUrl ? (
            <img src={adDetail.thumbnailUrl} alt="Ad Thumbnail" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
          ) : (
            getPlatformIcon(adDetail.platform)
          )}
          <div className="flex flex-col flex-1">
            <Text as="h2" size="xl" weight="bold" className="mb-2 block font-extrabold" style={{ color: COLORS.text }}>{adDetail.adName || 'Unnamed Ad'}</Text>
            <Text size="xs" weight="bold" className="px-3 py-1 rounded-full self-start inline-block" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark }}>
              {adDetail.platform || 'Unknown Platform'}
            </Text>
          </div>
        </div>

        <div className="flex gap-4 p-4 rounded-2xl border" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.grey }}>
          <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => router.push(`/leads_list?adId=${adId}&status=Closed`)}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7', color: COLORS.success }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
            </div>
            <div className="flex flex-col">
              <Text as="span" size="lg" weight="bold" className="font-extrabold block" style={{ color: COLORS.text }}>{conversionRate ? `${conversionRate}%` : '--'}</Text>
              <Text as="span" size="xs" weight="bold" className="block" style={{ color: COLORS.subtle }}>Conversion</Text>
            </div>
          </div>
          <div className="w-[1px]" style={{ backgroundColor: COLORS.border }}></div>
          <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => router.push(`/leads_list?adId=${adId}&status=Disqualified`)}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: COLORS.danger }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
            </div>
            <div className="flex flex-col">
              <Text as="span" size="lg" weight="bold" className="font-extrabold block" style={{ color: COLORS.text }}>{disqualifiedRate ? `${disqualifiedRate}%` : '--'}</Text>
              <Text as="span" size="xs" weight="bold" className="block" style={{ color: COLORS.subtle }}>Disqualified</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Header */}
      <div className="flex justify-between items-end mb-6">
        <Text as="h2" size="2xl" weight="bold" className="font-extrabold block" style={{ color: COLORS.text }}>Lead Pipeline</Text>
        <select
          value={selectedFilter}
          onChange={handleFilterChange}
          className="border font-bold text-sm rounded-xl px-4 py-2 focus:outline-none shadow-sm cursor-pointer"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey, color: COLORS.text }}
        >
          <option value="This Day">This Day</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="Overall">Overall</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {leadCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => {
              const statusQuery = card.title === "All Leads" ? "" : `&status=${card.title}`;
              router.push(`/leads_list?adId=${adId}${statusQuery}`);
            }}
            className="p-4 rounded-2xl shadow-sm border flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow h-[120px]"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
          >
            <div className="flex justify-between items-start w-full">
              <div className="p-2 rounded-xl" style={{ backgroundColor: card.bg, color: card.color }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: COLORS.border }}><polyline points="9 18 15 12 9 6" /></svg>
            </div>
            <div className="flex flex-col mt-2">
              <Text as="span" size="2xl" weight="bold" className="font-extrabold leading-none block" style={{ color: COLORS.text }}>{card.value != null ? card.value : '--'}</Text>
              <Text as="span" size="xs" weight="bold" className="mt-1 truncate block" style={{ color: COLORS.muted }}>{card.title}</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
