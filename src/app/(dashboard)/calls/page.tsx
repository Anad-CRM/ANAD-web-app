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
  const [isModalLoading, setIsModalLoading] = useState(false);

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
      "Connected": "incoming" 
    };

    const params: any = {
      callType: callTypeMap[type] || "totalCalls",
    };
    if (dateRange.startDate) params.startDate = dateRange.startDate.split("T")[0];
    if (dateRange.endDate) params.endDate = dateRange.endDate.split("T")[0];
    if (staffId) params.staffIds = [staffId];

    try {
      const logs = await getSpecificCallLogs(params);
      setModalCalls(logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setModalCalls([]);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-h-screen pb-12 bg-[#F7F8FA] animate-slide-up-fade">
      
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

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 mb-8 items-stretch">
          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 flex flex-col">
            <CallsOverTimeChart />
          </div>
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col justify-center">
            <CallsStatusChart analytics={analytics} />
          </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
        <DetailedCallBreakdown data={tableData} isLoading={isLoading} />
      </div>

      <CallDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        calls={modalCalls}
        isLoading={isModalLoading}
      />

    </div>
  );
}
