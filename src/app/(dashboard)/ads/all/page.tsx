"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdCampaign } from "@/modules/ads/types";
import { getAllAdsPage, getLiveAds } from "@/modules/ads/api/adsApi";
import { ArrowLeft, Search, X, MousePointerClick, Eye, ChevronRight } from "lucide-react";
import { Text } from "@/core/components/ui/Text";
import { COLORS, getPlatformColor } from "@/core/components/theme/colors";
import { PlatformAvatar, AdImage } from "@/modules/ads/components/PlatformAvatar";

const PAGE_SIZE = 12;


// ─── Live Ad Card (horizontal scroll) ────────────────────────────────────────

function LiveAdCard({ ad, onClick }: { ad: AdCampaign; onClick: () => void }) {
  const color = getPlatformColor(ad.platform);
  const ctr =
    ad.totalImpressions
      ? ((ad.totalClicks / ad.totalImpressions) * 100).toFixed(1)
      : "0";

  return (
    <div
      onClick={onClick}
      className="relative flex-shrink-0 w-[82vw] max-w-[240px] snap-start rounded-[22px] overflow-hidden cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.10)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 transition-all duration-200 border sm:w-[240px]"
      style={{ borderColor: `${color}22`, backgroundColor: COLORS.surface }}
    >
      {/* Image or branded placeholder */}
      <div className="w-full h-[128px] relative overflow-hidden sm:h-[140px]">
        {ad.thumbnailUrl ? (
          <>
            <AdImage
              src={ad.thumbnailUrl}
              alt={ad.adName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${color}1A` }}
          >
            <PlatformAvatar platform={ad.platform} size={64} />
          </div>
        )}

        {/* Platform chip — top left */}
        <div
          className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-white shadow-sm sm:top-3 sm:left-3 sm:px-2.5 sm:py-1"
          style={{ backgroundColor: `${color}dd` }}
        >
          <Text weight="bold" style={{ fontSize: '10px' }} className="sm:text-[12px]">{ad.platform ?? "Unknown"}</Text>
        </div>

        {/* LIVE badge — top right */}
        <div
          className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-white shadow-md sm:top-3 sm:right-3 sm:px-2.5 sm:py-1"
          style={{ backgroundColor: COLORS.success }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
          <Text weight="bold" style={{ fontSize: '10px' }} className="sm:text-[12px]">LIVE</Text>
        </div>
      </div>

      {/* Bottom info */}
      <div className="p-3 sm:p-4">
        <Text size="sm" weight="bold" className="truncate block mb-2 text-[13px] sm:text-sm" style={{ color: COLORS.text }}>
          {ad.adName || "Unnamed Ad"}
        </Text>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-1">
            <MousePointerClick className="w-3 h-3" style={{ color: COLORS.primary }} />
            <Text size="xs" weight="bold" style={{ color: COLORS.primary }}>
              {(ad.totalClicks ?? 0).toLocaleString()}
            </Text>
            <Text size="xs" style={{ color: COLORS.subtle }}>Clicks</Text>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" style={{ color: COLORS.violet }} />
            <Text size="xs" weight="bold" style={{ color: COLORS.violet }}>
              {ctr}%
            </Text>
            <Text size="xs" style={{ color: COLORS.subtle }}>CTR</Text>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Regular Ad Card (list) ───────────────────────────────────────────────────

function AdCard({ ad, onClick }: { ad: AdCampaign; onClick: () => void }) {
  const color = getPlatformColor(ad.platform);

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-start gap-4 p-4 rounded-[18px] cursor-pointer border hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
    >
      <PlatformAvatar thumbnailUrl={ad.thumbnailUrl} platform={ad.platform} size={52} />

      <div className="flex-1 min-w-0">
        <Text size="sm" weight="bold" className="truncate block mb-1.5" style={{ color: COLORS.text }}>
          {ad.adName || "Unnamed Ad"}
        </Text>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div
            className="px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}18`, color }}
          >
            <Text weight="semibold" style={{ fontSize: '11px' }}>{ad.platform || "Unknown"}</Text>
          </div>
          {ad.effective_status && (
            <div
              className="px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: ad.isLive ? "#DCFCE7" : COLORS.primaryXlight,
                color: ad.isLive ? COLORS.success : COLORS.muted,
              }}
            >
              <Text weight="semibold" style={{ fontSize: '11px' }}>{ad.effective_status}</Text>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            <MousePointerClick className="w-3.5 h-3.5" style={{ color: COLORS.primary }} />
            <Text size="xs" weight="bold" style={{ color: COLORS.primary }}>
              {(ad.totalClicks ?? 0).toLocaleString()}
            </Text>
            <Text size="xs" style={{ color: COLORS.subtle }}>Clicks</Text>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" style={{ color: COLORS.violet }} />
            <Text size="xs" weight="bold" style={{ color: COLORS.violet }}>
              {(ad.totalImpressions ?? 0).toLocaleString()}
            </Text>
            <Text size="xs" style={{ color: COLORS.subtle }}>Imp.</Text>
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 flex-shrink-0 self-end sm:self-auto" style={{ color: COLORS.subtle }} />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LiveAdSkeleton() {
  return (
    <div
      className="flex-shrink-0 w-[82vw] max-w-[240px] snap-start rounded-[22px] overflow-hidden border sm:w-[240px]"
      style={{ borderColor: COLORS.grey, backgroundColor: COLORS.surface }}
    >
      <div className="w-full h-[128px] animate-pulse sm:h-[140px]" style={{ backgroundColor: COLORS.bg }} />
      <div className="p-3 space-y-2 sm:p-4">
        <div className="h-4 rounded-lg animate-pulse w-3/4" style={{ backgroundColor: COLORS.bg }} />
        <div className="h-3 rounded-lg animate-pulse w-1/2" style={{ backgroundColor: COLORS.bg }} />
      </div>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  accentColor,
  count,
}: {
  title: string;
  accentColor: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: accentColor }} />
      <Text as="h2" size="lg" weight="bold" style={{ color: COLORS.text }}>
        {title}
      </Text>
      {count != null && (
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-bold"
          style={{ backgroundColor: accentColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          {count}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AllAdsPage() {
  const router = useRouter();
  const [allAds, setAllAds] = useState<AdCampaign[]>([]);
  const [liveAds, setLiveAds] = useState<AdCampaign[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchAdsPage = useCallback(async (nextPage = 1, replace = false) => {
    try {
      const [allAdsData, liveAdsData] = await Promise.all([
        getAllAdsPage({ page: nextPage, limit: PAGE_SIZE }),
        nextPage === 1 ? getLiveAds() : Promise.resolve(null),
      ]);

      if (replace) {
        setAllAds(allAdsData.data);
      } else {
        setAllAds((prev) => {
          const seen = new Set(prev.map((ad) => ad.adId));
          const merged = [...prev];
          allAdsData.data.forEach((ad) => {
            if (!seen.has(ad.adId)) {
              seen.add(ad.adId);
              merged.push(ad);
            }
          });
          return merged;
        });
      }

      setHasMore(allAdsData.hasMore);
      setPage(nextPage + 1);

      if (liveAdsData) {
        setLiveAds(liveAdsData);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      await fetchAdsPage(1, true);
    };
    fetchAds();
  }, [fetchAdsPage]);

  const filteredAllAds = useMemo(() => {
    if (!searchQuery) return allAds;
    const q = searchQuery.toLowerCase();
    return allAds.filter(
      (ad) =>
        ad.adName?.toLowerCase().includes(q) ||
        ad.platform?.toLowerCase().includes(q)
    );
  }, [allAds, searchQuery]);

  const filteredLiveAds = useMemo(() => {
    if (!searchQuery) return liveAds;
    const q = searchQuery.toLowerCase();
    return liveAds.filter(
      (ad) =>
        ad.adName?.toLowerCase().includes(q) ||
        ad.platform?.toLowerCase().includes(q)
    );
  }, [liveAds, searchQuery]);

  const liveIds = new Set(filteredLiveAds.map((a) => a.adId));
  const otherAds = filteredAllAds.filter((a) => !liveIds.has(a.adId));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          setIsLoadingMore(true);
          fetchAdsPage(page, false);
        }
      },
      { threshold: 0.1, rootMargin: "120px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchAdsPage, hasMore, isLoading, isLoadingMore, page]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 px-1 pt-1">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors shadow-md flex-shrink-0 hover:opacity-80"
          style={{ backgroundColor: COLORS.primaryDark }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Text as="h1" size="2xl" weight="bold" style={{ color: COLORS.text }}>
          All Ads
        </Text>
      </div>

      {/* Search bar */}
      <div
        className="mb-6 flex items-center rounded-2xl border px-4 shadow-sm"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.grey }}
      >
        <Search className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.subtle }} />
        <input
          type="text"
          className="flex-1 border-none focus:outline-none focus:ring-0 p-3 text-sm bg-transparent font-[Roboto,sans-serif]"
          style={{ color: COLORS.text }}
          placeholder="Search ads by name or platform..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="hover:opacity-70 flex-shrink-0"
            style={{ color: COLORS.subtle }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-8">
          <div>
            <div className="h-6 w-24 rounded-lg animate-pulse mb-4" style={{ backgroundColor: COLORS.grey }} />
            <div className="flex gap-4 overflow-x-hidden">
              {[1, 2, 3].map((i) => <LiveAdSkeleton key={i} />)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 rounded-[18px] animate-pulse"
                style={{ backgroundColor: COLORS.surface }}
              />
            ))}
          </div>
        </div>
      ) : filteredAllAds.length === 0 && filteredLiveAds.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-24 gap-4">
          <Search className="w-12 h-12 opacity-20" style={{ color: COLORS.muted }} />
          <Text size="base" weight="medium" style={{ color: COLORS.muted }}>
            No ads found{searchQuery ? ` for "${searchQuery}"` : ""}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* Live Ads — horizontal scroll */}
          {filteredLiveAds.length > 0 && (
            <div>
              <SectionHeader
                title="Live Ads"
                accentColor={COLORS.success}
                count={filteredLiveAds.length}
              />
              <div
                className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:gap-4"
                style={{ scrollbarWidth: "none" }}
              >
                {filteredLiveAds.map((ad) => (
                  <LiveAdCard
                    key={ad.adId}
                    ad={ad}
                    onClick={() => router.push(`/ads/${ad.adId}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other / All Ads — vertical list */}
          {otherAds.length > 0 && (
            <div>
              <SectionHeader
                title={filteredLiveAds.length > 0 ? "Other Ads" : "All Ads"}
                accentColor={COLORS.primary}
              />
              <div className="flex flex-col gap-3">
                {otherAds.map((ad) => (
                  <AdCard
                    key={ad.adId}
                    ad={ad}
                    onClick={() => router.push(`/ads/${ad.adId}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {hasMore && (
            <div ref={loadMoreRef} className="flex h-24 items-center justify-center py-4">
              {isLoadingMore && (
                <div
                  className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 shadow-sm"
                  style={{ borderColor: COLORS.grey, color: COLORS.subtle }}
                >
                  <div
                    className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-current"
                    style={{ borderTopColor: COLORS.primary }}
                  />
                  <Text size="sm" weight="medium" style={{ color: COLORS.muted }}>
                    Loading more ads...
                  </Text>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
