"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import StatsSection from "@/modules/follow-up/components/StatsSection";
import FollowUpList from "@/modules/follow-up/components/FollowUpList";
import RightPanel from "@/modules/follow-up/components/RightPanel";
import RescheduleModal from "@/modules/follow-up/components/RescheduleModal";
import CompleteModal from "@/modules/follow-up/components/CompleteModal";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import {
  getFollowUps,
  getFollowUpSummary,
} from "@/modules/follow-up/api/followUpApi";
import { FollowUp, FollowUpSummary } from "@/modules/follow-up/types";

export default function FollowUpPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<FollowUpSummary>({
    total: 0,
    completed: 0,
    missed: 0,
    pending: 0,
    rescheduled: 0,
    updatedToMissed: 0,
  });
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [missedFollowUps, setMissedFollowUps] = useState<FollowUp[]>([]);
  const [activeTab, setActiveTab] = useState("total");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 20;
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

      const summaryData = await getFollowUpSummary();
      if (summaryData?.data) {
        setSummary(summaryData.data);
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
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
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
  }, [fetchData, hasMore, isFetchingMore, isLoading]);

  const handleReschedule = (id: number) => {
    setRescheduleId(id);
  };

  const handleComplete = (id: number) => {
    setCompleteId(id);
  };

  const handleModalSuccess = () => {
    fetchData(true);
  };

  const handleTabChange = (tab: string) => {
    router.push(`/follow-up/all?status=${tab}`);
  };

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    if (activeTab === "today") {
      setActiveTab("total");
    }
  };

  return (
    <div className="flex flex-col gap-[22px] overflow-x-hidden min-w-0">
      <StatsSection
        summary={summary}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 mt-5 min-h-0 xl:h-[calc(100vh-240px)]">
        <div className="flex-1 flex flex-col xl:pr-8 xl:border-r min-h-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-6 shrink-0">
            <Text as="h2" weight="bold" size="lg" style={{ color: COLORS.text }}>
              Total Follow-Up
            </Text>
            <Text size="sm" weight="medium" style={{ color: COLORS.muted }}>
              {selectedDate 
                ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long' })
                : activeTab === 'today'
                  ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + new Date().toLocaleDateString('en-GB', { weekday: 'long' })
                  : "All Dates"}
            </Text>
          </div>
          <div className="pr-0 xl:pr-2 flex-1 overflow-y-auto custom-scrollbar min-h-0">
            <FollowUpList
              followUps={followUps}
              onReschedule={handleReschedule}
              onComplete={handleComplete}
              hasMore={hasMore}
              isFetchingMore={isFetchingMore}
              loadMoreRef={loadMoreRef}
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
