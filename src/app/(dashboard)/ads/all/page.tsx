"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdCampaign } from "@/modules/ads/types";
import { getAllAds, getLiveAds } from "@/modules/ads/api/adsApi";
import { ArrowLeft } from "lucide-react";
import { Text } from "@/core/components/ui/Text";

export default function AllAdsPage() {
  const router = useRouter();
  const [allAds, setAllAds] = useState<AdCampaign[]>([]);
  const [liveAds, setLiveAds] = useState<AdCampaign[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      const [allAdsData, liveAdsData] = await Promise.all([
        getAllAds(),
        getLiveAds()
      ]);
      setAllAds(allAdsData);
      setLiveAds(liveAdsData);
      setIsLoading(false);
    };
    fetchAds();
  }, []);

  const filteredAllAds = useMemo(() => {
    if (!searchQuery) return allAds;
    const lowerQuery = searchQuery.toLowerCase();
    return allAds.filter(ad =>
      ad.adName?.toLowerCase().includes(lowerQuery) ||
      ad.platform?.toLowerCase().includes(lowerQuery)
    );
  }, [allAds, searchQuery]);

  const filteredLiveAds = useMemo(() => {
    if (!searchQuery) return liveAds;
    const lowerQuery = searchQuery.toLowerCase();
    return liveAds.filter(ad =>
      ad.adName?.toLowerCase().includes(lowerQuery) ||
      ad.platform?.toLowerCase().includes(lowerQuery)
    );
  }, [liveAds, searchQuery]);

  const getPlatformIcon = (platform: string) => {
    const initial = platform?.charAt(0) || "A";
    return <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">{initial}</div>;
  };

  return (
    <div className="flex flex-col p-1 w-full max-w-[1600px] mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-md flex-shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Text as="h1" size="2xl" weight="bold" className="text-gray-900">All Ads</Text>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-2 mb-8 border border-gray-100 flex items-center">
        <svg className="ml-3 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          className="flex-1 border-none focus:outline-none focus:ring-0 p-3 text-sm text-gray-700 bg-transparent font-[Roboto,sans-serif]"
          placeholder="Search ads by name or platform..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="mr-3 text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-gray-400 animate-pulse">
          <Text size="base">Loading ads...</Text>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {filteredLiveAds.length > 0 && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
                <Text as="h2" size="lg" weight="bold" className="text-[#0C2C55]">Live Ads</Text>
                <div className="bg-green-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <Text size="xs" weight="bold">{filteredLiveAds.length}</Text>
                </div>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                {filteredLiveAds.map(ad => (
                  <div
                    key={ad.adId}
                    onClick={() => router.push(`/ads/${ad.adId}`)}
                    className="min-w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow snap-start"
                  >
                    <div className="flex justify-between items-start mb-3">
                      {getPlatformIcon(ad.platform)}
                      <Text as="span" size="xs" weight="bold" className="bg-green-100 text-green-700 px-2 py-1 rounded-lg block">LIVE</Text>
                    </div>
                    <Text as="h3" size="base" weight="bold" className="text-gray-900 mb-1 truncate block">{ad.adName || 'Unnamed Ad'}</Text>
                    <Text as="p" size="xs" className="text-gray-500 mb-4 block">{ad.platform || 'Unknown Platform'}</Text>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <Text as="span" size="xs" weight="semibold" className="text-gray-500">Clicks</Text>
                        <Text as="span" size="sm" weight="bold" className="text-[#233A78]">{ad.totalClicks?.toLocaleString() || 0}</Text>
                      </div>
                      <div className="flex flex-col">
                        <Text as="span" size="xs" weight="semibold" className="text-gray-500">Impressions</Text>
                        <Text as="span" size="sm" weight="bold" className="text-[#233A78]">{ad.totalImpressions?.toLocaleString() || 0}</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(filteredAllAds.length > 0 || filteredLiveAds.length === 0) && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-[#233A78] rounded-full"></div>
                <Text as="h2" size="lg" weight="bold" className="text-[#0C2C55]">{filteredLiveAds.length > 0 ? 'Other Ads' : 'All Ads'}</Text>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAllAds.map(ad => (
                  <div
                    key={ad.adId}
                    onClick={() => router.push(`/ads/${ad.adId}`)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-4"
                  >
                    {getPlatformIcon(ad.platform)}
                    <div className="flex flex-col flex-1 min-w-0">
                      <Text as="h3" size="sm" weight="bold" className="text-gray-900 truncate mb-1 block">{ad.adName || 'Unnamed Ad'}</Text>
                      <div className="flex items-center gap-2">
                        <Text as="span" size="custom" weight="semibold" className="bg-[#EAEFF5] text-[#233A78] text-xs px-2 py-0.5 rounded-full block">{ad.platform || 'Unknown'}</Text>
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                ))}
                {filteredAllAds.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400">
                    <Text size="base">No ads found.</Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
