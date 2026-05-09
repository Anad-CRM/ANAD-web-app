"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CallsHeader } from "@/modules/calls/components/CallsHeader";
import { CallTypeFilters } from "@/modules/calls/components/CallTypeFilters";
import { CallsOverTimeChart } from "@/modules/calls/components/CallsOverTimeChart";
import { CallsStatusChart } from "@/modules/calls/components/CallsStatusChart";
import { DetailedCallBreakdown } from "@/modules/calls/components/DetailedCallBreakdown";
import { CallDetailsModal } from "@/modules/calls/components/CallDetailsModal";
import { CallFilterType, CallTeamRow, CallAnalyticsResponse, CallLog } from "@/modules/calls/types";
import { getCallAnalytics, getStaffCallBreakdown, getSpecificCallLogs } from "@/modules/calls/api/callsApi";

export default function CallAnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState<CallFilterType>("Total");
  const [analytics, setAnalytics] = useState<CallAnalyticsResponse | null>(null);
  const [tableData, setTableData] = useState<CallTeamRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering state
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null
  });
  const [dateLabel, setDateLabel] = useState("Overall");
  const [staffId, setStaffId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalCalls, setModalCalls] = useState<CallLog[]>([]);
  const [modalTotalCount, setModalTotalCount] = useState<number>(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const getFilterCount = useCallback((type: CallFilterType) => {
    if (!analytics) return 0;
    const { summary, callTypes: types } = analytics;
    switch(type) {
      case "Total": return summary.totalCalls || 0;
      case "Incoming": return types.incoming.count || 0;
      case "Outgoing": return types.outgoing.count || 0;
      case "Missed": return types.missed.count || 0;
      case "Rejected": return types.rejected.count || 0;
      case "Personal": return types.personalCalls.count || 0;
      case "New": return types.newCalls.count || 0;
      case "NotPickedUp": return types.notPickedUpCalls.count || 0;
      case "Connected": return (types.incoming.count || 0) + (types.outgoing.count || 0);
      default: return 0;
    }
  }, [analytics]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    const params: any = {};
    if (dateRange.startDate) {
      params.startDate = dateRange.startDate.split("T")[0];
      params.endDate = dateRange.endDate?.split("T")[0];
    }
    if (staffId) params.staffIds = [staffId];

    const breakdownParams = { ...params };
    if (!breakdownParams.startDate) {
       breakdownParams.startDate = "2024-01-01"; 
       breakdownParams.endDate = new Date().toISOString().split("T")[0];
    }

    try {
      const [analyticsData, staffData] = await Promise.all([
        getCallAnalytics(params),
        getStaffCallBreakdown(breakdownParams)
      ]);
      
      if (analyticsData) setAnalytics(analyticsData);
      setTableData(staffData || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, staffId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = async (type: CallFilterType) => {
    setActiveFilter(type);
    
    // Open modal for specific call types (Parity with mobile app's navigation)
    setModalTitle(`${type} Calls`);
    setIsModalOpen(true);
    setIsModalLoading(true);

    const callTypeMap: Record<string, string> = {
      "Total": "totalCalls",
      "Incoming": "incoming",
      "Outgoing": "outgoing",
      "Missed": "missed",
      "Rejected": "rejected",
      "Personal": "personalCalls",
      "New": "newCalls",
      "NotPickedUp": "notPickedUpCalls",
      "Connected": "connected" 
    };

    const params: any = {
      callType: callTypeMap[type] || "totalCalls",
    };
    if (dateRange.startDate) params.startDate = dateRange.startDate.split("T")[0];
    if (dateRange.endDate) params.endDate = dateRange.endDate.split("T")[0];
    if (staffId) params.staffIds = [staffId];

    try {
      const { logs, totalCount } = await getSpecificCallLogs(params);
      setModalCalls(logs || []);
      setModalTotalCount(totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setModalCalls([]);
      setModalTotalCount(0);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[22px] min-h-screen pb-12 animate-slide-up-fade">
      
      <div className="px-1 pt-2">
        <CallsHeader 
          selectedDateLabel={dateLabel}
          onDateRangeChange={(range) => {
            setDateRange({ startDate: range.startDate, endDate: range.endDate });
            setDateLabel(range.label);
          }}
          onStaffChange={setStaffId}
        />
      </div>

      <div className="px-1">
        <CallTypeFilters 
          activeFilter={activeFilter} 
          onFilterChange={handleFilterChange} 
          analytics={analytics}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 mb-8 items-stretch pt-2">
          <div className="flex flex-col">
            <CallsOverTimeChart />
          </div>
          <div className="flex flex-col justify-center">
            <CallsStatusChart analytics={analytics} />
          </div>
      </div>

      <div className="pt-4">
        <DetailedCallBreakdown data={tableData} isLoading={isLoading} />
      </div>

      <CallDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        calls={modalCalls}
        totalCount={modalTotalCount}
        isLoading={isModalLoading}
        filters={{
          callType: activeFilter,
          startDate: dateRange.startDate ?? undefined,
          endDate: dateRange.endDate ?? undefined,
          staffId: staffId ?? undefined
        }}
      />

    </div>
  );
}
