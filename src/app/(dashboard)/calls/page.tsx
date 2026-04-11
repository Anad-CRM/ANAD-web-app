"use client";

import React, { useState, useEffect } from "react";
import { CallsHeader } from "@/modules/calls/components/CallsHeader";
import { CallTypeFilters } from "@/modules/calls/components/CallTypeFilters";
import { CallsOverTimeChart } from "@/modules/calls/components/CallsOverTimeChart";
import { CallsStatusChart } from "@/modules/calls/components/CallsStatusChart";
import { DetailedCallBreakdown } from "@/modules/calls/components/DetailedCallBreakdown";
import { CallFilterType, CallTeamRow, CallAnalyticsResponse } from "@/modules/calls/types";
import { getCallAnalytics, getStaffCallBreakdown } from "@/modules/calls/api/callsApi";

export default function CallAnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState<CallFilterType>("Total");
  const [analytics, setAnalytics] = useState<CallAnalyticsResponse | null>(null);
  const [tableData, setTableData] = useState<CallTeamRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [analyticsData, staffData] = await Promise.all([
        getCallAnalytics(),
        getStaffCallBreakdown()
      ]);
      
      if (analyticsData) setAnalytics(analyticsData);
      setTableData(staffData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full bg-white sm:bg-[#F2F5F8] min-h-screen p-6 overflow-y-auto font-sans">
      
      <CallsHeader />

      <CallTypeFilters 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
        analytics={analytics}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 mb-4">
          <CallsOverTimeChart />
          <CallsStatusChart analytics={analytics} />
      </div>

      <DetailedCallBreakdown data={tableData} isLoading={isLoading} />

    </div>
  );
}
