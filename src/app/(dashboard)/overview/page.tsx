"use client";

import React, { useEffect, useState } from "react";
import LeadStatsSection from "@/modules/overview/components/LeadStatsSection";
import EodReportsSection from "@/modules/overview/components/EodReportsSection";
import { getLeadSummary, getEodReports } from "@/modules/overview/api/overviewApi";
import { LeadCountsData, StaffEodSummary } from "@/modules/overview/types";

export default function OverviewPage() {
  const [leadSummary, setLeadSummary] = useState<LeadCountsData | null>(null);
  const [eodData, setEodData] = useState<StaffEodSummary[]>([]);

  useEffect(() => {
    const loadOverviewData = async () => {
      const summary = await getLeadSummary();
      if (summary) setLeadSummary(summary);

      const eods = await getEodReports();
      if (eods) setEodData(eods);
    };
    loadOverviewData();
  }, []);
  return (
    <div className="flex flex-col gap-[22px]">
      <div className="mb-6">
        <h2 className="text-[28px] font-extrabold text-black leading-tight tracking-tight">Team<br/>Overview</h2>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-3 bg-[#A5BCD1] p-3 rounded-2xl flex-1">
          {["Managers", "Team leads", "Staff", "Students"].map((role) => (
            <button
              key={role}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white text-black font-bold text-[15px] shadow-sm flex-1 justify-center whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-full bg-[#233A78] flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              {role}
            </button>
          ))}
        </div>
        
        <button className="flex items-center justify-center w-[60px] h-[60px] rounded-2xl bg-[#233A78] text-white shadow-sm flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v4"/><path d="M10 16h4"/></svg>
        </button>
      </div>


      <div className="flex gap-4 mb-8">
        {[
          { title: "Performer of the Month", name: "No Data", team: "" },
          { title: "Performer of the Week", name: "No Data", team: "" }
        ].map((card, idx) => (
          <div key={idx} className="flex-1 bg-[#D6E4F0] rounded-2xl p-6 flex items-center gap-6 shadow-sm">
            <div className="w-[84px] h-[84px] rounded-full bg-[#233A78] flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[17px] font-bold text-[#1E293B] mb-2">{card.title}</h3>
              <p className="text-[16px] text-gray-700">
                Name : <span className="font-bold text-black opacity-50">{card.name}</span> <span className="text-[#22C55E] ml-1">{card.team}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <LeadStatsSection data={leadSummary} />
      <EodReportsSection eodData={eodData} />
    </div>
  );
}
