"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import StatsSection from "@/modules/follow-up/components/StatsSection";
import FollowUpList from "@/modules/follow-up/components/FollowUpList";
import RightPanel from "@/modules/follow-up/components/RightPanel";
import {
  getFollowUps,
  getFollowUpSummary,
  completeFollowUp,
} from "@/modules/follow-up/api/followUpApi";
import { FollowUp, FollowUpSummary } from "@/modules/follow-up/types";

export default function FollowUpPage() {
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

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 20;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setPage(1);
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
        page: isRefresh ? 1 : page 
      });
      const newFollowUps = followUpData?.data || [];

      setFollowUps(prev => (isRefresh ? newFollowUps : [...prev, ...newFollowUps]));

      if (newFollowUps.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (newFollowUps.length > 0) {
        setPage(prevPage => (isRefresh ? 2 : prevPage + 1));
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
  }, [activeTab, page, selectedDate]);

  useEffect(() => {
    fetchData(true);
  }, [activeTab, selectedDate]);

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
    console.log("Reschedule prompt triggered for ID:", id);
  };

  const handleComplete = async (id: number) => {
    try {
      await completeFollowUp(id);
      fetchData();
    } catch (error) {
      console.error("Complete error", error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedDate(null);
  };

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    if (activeTab === "today") {
      setActiveTab("total");
    }
  };

  return (
    <div className="flex flex-col gap-[22px] overflow-x-hidden">
      <StatsSection
        summary={summary}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex gap-8 mt-5 h-[calc(100vh-240px)] min-h-[500px]">
        <div className="flex-1 flex flex-col pr-8 border-r border-[#A5BCD1]/50 h-full min-h-0">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-[20px] font-bold text-[#1E293B]">
              Total Follow-Up
            </h2>
            <span className="text-[14px] text-gray-700 font-medium">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ',' + new Date().toLocaleDateString('en-GB', { weekday: 'long' })}
            </span>
          </div>
          <div className="pr-2 flex-1 overflow-y-auto custom-scrollbar min-h-0">
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
        />
      </div>
    </div>
  );
}
