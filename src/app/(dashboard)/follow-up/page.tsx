"use client";

import React, { useEffect, useState } from "react";
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

  const fetchData = async () => {
    try {
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

      const params: any = { status: statusMap[activeTab] };
      if (activeTab === "today") {
        params.date = new Date().toISOString().split('T')[0];
        delete params.status;
      }

      const followUpData = await getFollowUps({ ...params, limit: 100 });
      setFollowUps(followUpData?.data || []);

      const missedData = await getFollowUps({ status: "MISSED", limit: 50 });
      setMissedFollowUps(missedData?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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

  return (
    <div className="flex flex-col gap-[22px]">
      <StatsSection
        summary={summary}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex gap-8 mt-5">
        <div className="flex-1 flex flex-col pr-8 border-r border-[#A5BCD1]/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-bold text-[#1E293B]">
              Total Follow-Up
            </h2>
            <span className="text-[14px] text-gray-700 font-medium">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ',' + new Date().toLocaleDateString('en-GB', { weekday: 'long' })}
            </span>
          </div>
          <div className="pr-2">
            <FollowUpList
              followUps={followUps}
              onReschedule={handleReschedule}
              onComplete={handleComplete}
            />
          </div>
        </div>

        <RightPanel
          missedFollowUps={missedFollowUps}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>
    </div>
  );
}
