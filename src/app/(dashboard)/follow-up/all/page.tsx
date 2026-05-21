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

export default function AllFollowUpsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(searchParams.get("status")?.toLowerCase() || "total");
  const [selectedDate, setSelectedDate] = useState<string | null>(searchParams.get("date"));
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [missedFollowUps, setMissedFollowUps] = useState<FollowUp[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const [page, setPage] = useState(1);
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
        setPage(1);
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

  const getLabel = () => {
     if (selectedDate) return `Date: ${selectedDate}`;
     if (activeTab === "total") return "All List";
     return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  return (
    <div className="flex flex-col gap-[22px] overflow-x-hidden pt-2">
      <div className="flex items-center gap-4">
        <BackButton onClick={() => router.back()} />
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        <div>
           <h1 className="text-[24px] font-bold text-[#1E293B] leading-tight">All Follow-Ups</h1>
           <p className="text-[#233A78] text-[14px] font-semibold tracking-wide">Showing: {getLabel()}</p>
        </div>
      </div>

      <div className="flex gap-8 mt-5 h-[calc(100vh-170px)] min-h-[500px]">
        <div className="flex-1 flex flex-col pr-8 border-r border-[#A5BCD1]/50 h-full min-h-0">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-[20px] font-bold text-[#1E293B]">
              List View
            </h2>
            <span className="text-[14px] text-gray-700 font-medium bg-gray-100 rounded-full px-4 py-1">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + new Date().toLocaleDateString('en-GB', { weekday: 'long' })}
            </span>
          </div>
          <div className="pr-2 flex-1 overflow-y-auto custom-scrollbar min-h-0">
            <DetailedFollowUpList
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
