"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdCampaign } from "@/modules/ads/types";
import { getAdById } from "@/modules/ads/api/adsApi";
import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { getUser } from "@/core/utils/auth";

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
    return <div className="flex justify-center p-12 text-gray-400 animate-pulse">Loading ad details...</div>;
  }

  if (!adDetail) {
    return <div className="p-12 text-center text-gray-500">Ad not found.</div>;
  }

  const leadCards = [
    { title: "All Leads", value: leadCounts?.allLeadsCount, color: "text-[#1E56A0]", bg: "bg-[#1E56A0]/10" },
    { title: "New Leads", value: leadCounts?.newLeadCount, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    { title: "Follow Up", value: leadCounts?.followUpCount, color: "text-[#EE9B00]", bg: "bg-[#EE9B00]/10" },
    { title: "Hot Leads", value: leadCounts?.hotLeadCount, color: "text-[#CA6702]", bg: "bg-[#CA6702]/10" },
    { title: "Closed", value: leadCounts?.closedLeadCount, color: "text-[#005F73]", bg: "bg-[#005F73]/10" },
    { title: "Disqualified", value: leadCounts?.disqualifiedCount, color: "text-[#9B2226]", bg: "bg-[#9B2226]/10" },
    { title: "Contacted", value: leadCounts?.contactedLeadCount, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
    { title: "RNR", value: leadCounts?.rnrCount, color: "text-[#5A7190]", bg: "bg-[#5A7190]/10" },
    { title: "Not Interested", value: leadCounts?.notInterestCount, color: "text-[#8BA5C0]", bg: "bg-[#8BA5C0]/10" },
    { title: "Busy", value: leadCounts?.busyCount, color: "text-[#BB3E03]", bg: "bg-[#BB3E03]/10" },
    { title: "Switch Off", value: leadCounts?.switchOffCount, color: "text-[#4e448e]", bg: "bg-[#4e448e]/10" },
    { title: "Register", value: leadCounts?.registerCount, color: "text-[#94D2BD]", bg: "bg-[#94D2BD]/10" },
  ];

  const getPlatformIcon = (platform: string) => {
    const initial = platform?.charAt(0) || "A";
    return <div className="w-16 h-16 bg-[#233A78] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">{initial}</div>;
  };

  return (
    <div className="flex flex-col p-6 w-full max-w-[1200px] mx-auto bg-[#F7F8FA] min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-[#233A78]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ad Detail</h1>
      </div>

      {/* Ad Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-6 mb-6">
          {adDetail.thumbnailUrl ? (
            <img src={adDetail.thumbnailUrl} alt="Ad Thumbnail" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
          ) : (
             getPlatformIcon(adDetail.platform)
          )}
          <div className="flex flex-col flex-1">
            <h2 className="text-xl font-extrabold text-[#0C2C55] mb-2">{adDetail.adName || 'Unnamed Ad'}</h2>
            <div className="bg-[#EAEFF5] text-[#233A78] px-3 py-1 rounded-full text-xs font-bold self-start">
              {adDetail.platform || 'Unknown Platform'}
            </div>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-gray-50">
          <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => router.push(`/leads_list?adId=${adId}&status=Closed`)}>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-[#0C2C55]">{conversionRate ? `${conversionRate}%` : '--'}</span>
              <span className="text-xs font-bold text-gray-500">Conversion</span>
            </div>
          </div>
          <div className="w-[1px] bg-gray-200"></div>
          <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => router.push(`/leads_list?adId=${adId}&status=Disqualified`)}>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-[#0C2C55]">{disqualifiedRate ? `${disqualifiedRate}%` : '--'}</span>
              <span className="text-xs font-bold text-gray-500">Disqualified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Header */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-extrabold text-[#0C2C55]">Lead Pipeline</h2>
        <select 
          value={selectedFilter} 
          onChange={handleFilterChange}
          className="bg-white border border-gray-200 text-[#0C2C55] font-bold text-sm rounded-xl px-4 py-2 focus:outline-none shadow-sm cursor-pointer"
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
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow h-[120px]"
          >
            <div className="flex justify-between items-start w-full">
               <div className={`p-2 rounded-xl ${card.bg}`}>
                 <svg className={card.color} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
               </div>
               <svg className="text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-2xl font-extrabold text-[#0C2C55] leading-none">{card.value != null ? card.value : '--'}</span>
              <span className="text-xs font-bold text-gray-500 mt-1 truncate">{card.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
