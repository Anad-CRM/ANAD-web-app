"use client";

import React, { useState } from "react";
import { CallsHeader } from "@/modules/calls/components/CallsHeader";
import { CallTypeFilters } from "@/modules/calls/components/CallTypeFilters";
import { CallsOverTimeChart } from "@/modules/calls/components/CallsOverTimeChart";
import { CallsStatusChart } from "@/modules/calls/components/CallsStatusChart";
import { DetailedCallBreakdown } from "@/modules/calls/components/DetailedCallBreakdown";
import { CallFilterType, CallTeamRow } from "@/modules/calls/types";

export default function CallAnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState<CallFilterType>("Total");

  const mockTableData: CallTeamRow[] = [
    {
        id: "1",
        avatarUrl: "https://i.pravatar.cc/150?img=11",
        name: "nick D",
        callsMade: 130,
        received: 104,
        missed: 34,
        avgDuration: "4:13"
    },
    {
        id: "2",
        avatarUrl: "https://i.pravatar.cc/150?img=12",
        name: "nick D",
        callsMade: 130,
        received: 104,
        missed: 34,
        avgDuration: "4:13"
    },
    {
        id: "3",
        avatarUrl: "https://i.pravatar.cc/150?img=13",
        name: "nick D",
        callsMade: 130,
        received: 104,
        missed: 34,
        avgDuration: "4:13"
    }
  ];

  return (
    <div className="flex flex-col flex-1 w-full bg-white sm:bg-[#F2F5F8] min-h-screen p-6 overflow-y-auto font-sans">
      
      <CallsHeader />

      <CallTypeFilters 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 mb-4">
          <CallsOverTimeChart />
          <CallsStatusChart />
      </div>
      <DetailedCallBreakdown data={mockTableData} />

    </div>
  );
}
