"use client";

import React, { useEffect, useState } from "react";
import LeadStatsSection from "@/modules/overview/components/LeadStatsSection";
import EodReportsSection from "@/modules/overview/components/EodReportsSection";
import { getLeadSummary, getEodReports, getTopPerformers } from "@/modules/overview/api/overviewApi";
import { LeadCountsData, StaffEodSummary, TopPerformersResponse } from "@/modules/overview/types";
import { LeaderboardModal } from "@/modules/overview/components/LeaderboardModal";

const NAV_ROLES = [
  {
    name: "Managers",
    href: "/staffs?role=managers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    name: "Team Leads",
    href: "/staffs?role=team-leads",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: "Staff",
    href: "/staffs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    name: "Students",
    href: "/students",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

const PERFORMER_CARDS = [
  { title: "Performer of the Month", period: "Monthly", emoji: "🏆" },
  { title: "Performer of the Week", period: "Weekly", emoji: "⭐" },
];

export default function OverviewPage() {
  const [filter, setFilter] = useState("Overall");
  const [customStartDate, setCustomStartDate] = useState<string | undefined>();
  const [customEndDate, setCustomEndDate] = useState<string | undefined>();
  const [staffId, setStaffId] = useState<string | undefined>();
  const [leadSummary, setLeadSummary] = useState<LeadCountsData | null>(null);
  const [eodData, setEodData] = useState<StaffEodSummary[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformersResponse | null>(null);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<{title: string, data: any[]}>({title: "", data: []});

  useEffect(() => {
    const loadOverviewData = async () => {
      const summary = await getLeadSummary({ filter, customStartDate, customEndDate, staffId });
      if (summary) setLeadSummary(summary);
      const eods = await getEodReports();
      if (eods) setEodData(eods);

      const performers = await getTopPerformers();
      if (performers) setTopPerformers(performers);
    };
    loadOverviewData();
  }, [filter, customStartDate, customEndDate, staffId]);

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-extrabold text-[#1E293B] leading-tight tracking-tight">
            Team Overview
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Real-time performance snapshot</p>
        </div>

        {/* Calendar quick action */}
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C3A76] text-white text-[13px] font-semibold shadow-md hover:bg-[#11234D] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M12 14v4" /><path d="M10 16h4" />
          </svg>
          Schedule
        </button>
      </div>

      {/* ── Quick-nav role chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {NAV_ROLES.map((role) => (
          <a
            key={role.name}
            href={role.href}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#A5BCD1] transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1C3A76] flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
              {role.icon}
            </div>
            <span className="text-[14px] font-semibold text-[#1E293B] group-hover:text-[#1C3A76] transition-colors truncate">
              {role.name}
            </span>
          </a>
        ))}
      </div>

      {/* ── Performer cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PERFORMER_CARDS.map((card, idx) => {
          const performerData = idx === 0 ? topPerformers?.performerOfMonth?.performer : topPerformers?.performerOfWeek?.performer;

          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group/card"
              onClick={() => {
                const leaderboard = idx === 0 ? topPerformers?.performerOfMonth?.leaderboard : topPerformers?.performerOfWeek?.leaderboard;
                if (leaderboard && leaderboard.length > 0) {
                  setSelectedLeaderboard({
                    title: idx === 0 ? "Monthly Leaderboard" : "Weekly Leaderboard",
                    data: leaderboard
                  });
                  setLeaderboardModalOpen(true);
                }
              }}
              style={{
                background: idx === 0
                  ? "linear-gradient(135deg, #1C3A76 0%, #1E56A0 100%)"
                  : "linear-gradient(135deg, #0f7368 0%, #128C7E 100%)",
              }}
            >
              {/* BG decorative circle */}
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 bg-white" />
              <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full opacity-10 bg-white" />

              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0 shadow-inner overflow-hidden">
                {/* {performerData?.avatar ?
               (
                <img src={performerData.avatar} alt={performerData.userName} className="w-full h-full object-cover" />
              ) : (
                card.emoji
              )} */}


                {card.emoji}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-0.5">{card.period}</span>
                <h3 className="text-[15px] font-bold text-white truncate mb-1">{card.title}</h3>
                {performerData ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-white/90 font-medium truncate">{performerData.userName}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white flex-shrink-0">
                      {performerData.closedCount} closed
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <span className="text-[13px] text-white/70 font-medium">No data yet</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Lead Stats ── */}
      <LeadStatsSection
        data={leadSummary}
        filter={filter}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        staffId={staffId}
        onFilterChange={(opts) => {
          setFilter(opts.filter);
          setCustomStartDate(opts.customStartDate);
          setCustomEndDate(opts.customEndDate);
          setStaffId(opts.staffId);
        }}
      />

      {/* ── EOD Reports ── */}
      <EodReportsSection eodData={eodData} />
      
      {/* ── Leaderboard Modal ── */}
      <LeaderboardModal 
        open={leaderboardModalOpen} 
        title={selectedLeaderboard.title} 
        leaderboard={selectedLeaderboard.data} 
        onClose={() => setLeaderboardModalOpen(false)} 
      />
    </div>
  );
}
