"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DetailedFollowUpList from "@/modules/follow-up/components/DetailedFollowUpList";
import RightPanel from "@/modules/follow-up/components/RightPanel";
import RescheduleModal from "@/modules/follow-up/components/RescheduleModal";
import CompleteModal from "@/modules/follow-up/components/CompleteModal";
import { getFollowUps } from "@/modules/follow-up/api/followUpApi";
import { FollowUp } from "@/modules/follow-up/types";
import { BackButton } from "@/core/components/ui/BackButton";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { useResponsive } from "@/core/hooks/useResponsive";

export default function AllFollowUpsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isMobile } = useResponsive();

  const [activeTab, setActiveTab] = useState(searchParams.get("status")?.toLowerCase() || "total");
  const [selectedDate, setSelectedDate] = useState<string | null>(searchParams.get("date"));
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [missedFollowUps, setMissedFollowUps] = useState<FollowUp[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">(isMobile ? "list" : "calendar");

  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const limit = isMobile ? 10 : 20;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [completeId, setCompleteId] = useState<number | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        pageRef.current = 1;
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const statusMap: Record<string, string | undefined> = {
        total: undefined,
        done: "COMPLETED",
        missed: "MISSED",
        pending: "PENDING",
      };

      const params: Record<string, unknown> = { status: statusMap[activeTab] };
      if (activeTab === "today") {
        params.date = new Date().toISOString().split('T')[0];
        delete params.status;
      }
      
      if (selectedDate) {
        params.date = selectedDate;
      }

      const followUpData = await getFollowUps({ 
        ...params, 
        limit, 
        page: isRefresh ? 1 : pageRef.current 
      });
      const newFollowUps = followUpData?.data || [];

      setFollowUps(prev => (isRefresh ? newFollowUps : [...prev, ...newFollowUps]));

      if (newFollowUps.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (newFollowUps.length > 0) {
        pageRef.current = isRefresh ? 2 : pageRef.current + 1;
      }

      if (isRefresh) {
        const missedData = await getFollowUps({ status: "MISSED", limit: 50, page: 1 });
        setMissedFollowUps(missedData?.data || []);
      }
    } catch (error) {
      console.error(error);
      if (!isRefresh) setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [activeTab, selectedDate, limit]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    if (isMobile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          fetchData();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
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
  }, [fetchData, hasMore, isFetchingMore, isLoading, isMobile]);

  const handleReschedule = (id: number) => {
    setRescheduleId(id);
  };

  const handleComplete = (id: number) => {
    setCompleteId(id);
  };

  const handleModalSuccess = () => {
    fetchData(true);
  };

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    if (activeTab === "today") {
      setActiveTab("total");
    }
  };

  useEffect(() => {
    if (isMobile) {
      setViewMode("list");
    }
  }, [isMobile]);

  const getLabel = () => {
     if (selectedDate) {
       const d = new Date(selectedDate);
       return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
     }
     if (activeTab === "total") return "All Follow-Ups";
     if (activeTab === "today") return "Today";
     return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  return (
    <div className="flex flex-col gap-[22px] overflow-x-hidden pt-2 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <BackButton onClick={() => router.back()} />
        <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1"></div>
        <div>
          <Text as="h1" weight="bold" size="xl" style={{ color: COLORS.text, lineHeight: 1.15 }}>
            All Follow-Ups
          </Text>
          <Text size="sm" weight="semibold" className="tracking-wide mt-0.5 block" style={{ color: COLORS.primaryDark }}>
            Showing: {getLabel()}
          </Text>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 mt-2 min-h-0 xl:h-[calc(100vh-170px)]">
        <div className="flex-1 flex flex-col xl:pr-8 xl:border-r min-h-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4 shrink-0">
            <Text as="h2" weight="bold" size="lg" style={{ color: COLORS.text }}>
              {getLabel()}
            </Text>
            <span className="text-[13px] font-medium bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5" style={{ color: COLORS.muted }}>
              {followUps.length} result{followUps.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="pr-0 xl:pr-2 flex-1 overflow-y-auto custom-scrollbar min-h-0">
            <DetailedFollowUpList
              followUps={followUps}
              onReschedule={handleReschedule}
              onComplete={handleComplete}
              hasMore={hasMore}
              isFetchingMore={isFetchingMore}
              loadMoreRef={loadMoreRef}
              onLoadMore={isMobile ? () => fetchData() : undefined}
            />
          </div>
        </div>

        <RightPanel
          missedFollowUps={missedFollowUps}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          onReschedule={handleReschedule}
        />
      </div>

      {/* Reschedule Modal */}
      {rescheduleId !== null && (
        <RescheduleModal
          followUpId={rescheduleId}
          onClose={() => setRescheduleId(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Complete Modal */}
      {completeId !== null && (
        <CompleteModal
          followUpId={completeId}
          onClose={() => setCompleteId(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
