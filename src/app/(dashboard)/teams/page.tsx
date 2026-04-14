"use client";

import { useTeams } from "@/modules/teams/hooks/useTeams";

export default function TeamsPage() {
  const { teams, stats, isLoading, error } = useTeams();

  const TEAM_STATS = [
    { label: `${stats.totalTeams} Teams`, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: `${stats.totalMembers} Members`, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: `${stats.activeTeams} Active Teams`, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex justify-end gap-6 mb-12">
        <button className="flex items-center gap-3 bg-[#E2E8F0] shadow-sm text-black px-6 py-3 rounded-full font-medium transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Team
        </button>
        <button className="flex items-center gap-3 bg-[#E2E8F0] shadow-sm text-black px-6 py-3 rounded-full font-medium transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {TEAM_STATS.map((stat, idx) => (
          <div key={idx} className="bg-[#EAF1F8] border border-white rounded-[20px] p-4 flex items-center gap-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)]">
            <div className="bg-[#1E3A8A] text-white w-14 h-14 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm">
              {stat.icon}
            </div>
            <span className="text-[17px] font-medium text-black">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-black mb-6">All Teams</h2>
        
        {isLoading ? (
          <div className="w-full flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>
        ) : teams.length === 0 ? (
          <div className="text-gray-500 bg-white/50 p-6 text-center rounded-xl font-medium">No teams found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {teams.map((team, idx) => {
              const membersCount = team.users?.length || 0;
              const totalLeads = team.users?.reduce((acc, user) => acc + (user.leadCounts?.totalLeads || 0), 0) || 0;
              const positiveLeads = team.users?.reduce(
                (acc, user) => acc + (user.leadCounts?.closedCount || 0) + (user.leadCounts?.contactedCount || 0), 
                0
              ) || 0;
              const performance = totalLeads > 0 ? Math.round((positiveLeads / totalLeads) * 100) : 0;

              return (
                <div key={team.id || idx} className="bg-[#EAF1F8] border border-white rounded-[24px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] flex flex-col min-h-[220px]">
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#1E3A8A] text-white w-14 h-14 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <h3 className="text-[20px] font-bold text-black tracking-tight line-clamp-1">{team.name}</h3>
                  </div>

                  <div className="flex flex-col gap-4 pl-4 mb-8">
                    <div className="text-[16px] text-black">
                      Members : <span className="font-semibold">{membersCount}</span>
                    </div>
                    <div className="text-[16px] text-black">
                      Leads : <span className="font-semibold">{totalLeads}</span>
                    </div>
                    <div className="text-[16px] text-black">
                      Performance : <span className="font-semibold">{performance}%</span>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end">
                    <button className="bg-[#1E3A8A] hover:bg-[#152e73] transition-colors text-white text-[14px] font-medium px-8 py-2.5 rounded-full">
                      View Details
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
