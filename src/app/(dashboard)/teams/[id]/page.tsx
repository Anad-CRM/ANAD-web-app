"use client";

import { useTeamDetails } from "@/modules/teams/hooks/useTeamDetails";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const { team, leadCounts, totalLeads, isLoading, error } = useTeamDetails(teamId);
  
  const leadStatuses = [
    { name: "All Leads", count: totalLeads },
    { name: "New Lead", count: leadCounts?.newLead || 0 },
    { name: "Hot Lead", count: leadCounts?.hotLead || 0 },
    { name: "Contacted", count: leadCounts?.contacted || 0 },
    { name: "Follow Up", count: leadCounts?.followUp || 0 },
    { name: "RNR", count: leadCounts?.rnr || 0 },
    { name: "Busy", count: leadCounts?.busy || 0 },
    { name: "Switch Off", count: leadCounts?.switchedOff || 0 },
    { name: "Not Interested", count: leadCounts?.notInterested || 0 },
    { name: "Register", count: leadCounts?.registered || 0 },
    { name: "Closed", count: leadCounts?.closed || 0 },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="text-red-500 bg-red-50 p-6 rounded-xl flex flex-col gap-4 items-start">
        {error || "Team not found."}
        <button onClick={() => router.push('/teams')} className="px-4 py-2 bg-white text-red-500 rounded-md font-medium shadow-sm">
            Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => router.push('/teams')} className="p-2 bg-white shadow-sm hover:bg-gray-50 rounded-full transition">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 className="text-[24px] font-bold text-black">{team.name} Details</h1>
      </div>

     <div className="bg-white border rounded-[24px] p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-[#1E3A8A] text-white w-14 h-14 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
                <h3 className="text-[20px] font-bold text-black">{team.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{team.users?.length || 0} Members assigned</p>
            </div>
        </div>
        
        <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-[#E2E8F0] hover:bg-[#cbd5e1] shadow-sm text-black px-5 py-2.5 rounded-full font-medium transition-all text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
                Filter Leads
            </button>
        </div>
     </div>

      <div>
        <h2 className="text-[18px] font-bold text-black mb-4">Leads Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {leadStatuses.map((status, idx) => (
            <div key={idx} className="bg-[#EAF1F8] border border-white rounded-[16px] p-4 flex flex-col items-center justify-center gap-2 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md cursor-pointer">
              <span className="text-[24px] font-bold text-[#1E3A8A]">
                {status.count.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-gray-600 text-center uppercase tracking-wide">
                {status.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-[18px] font-bold text-black mb-4 flex items-center justify-between">
            Team Members
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.users?.map((member) => (
                <div key={member.id} className="bg-white border hover:border-gray-300 transition-colors rounded-[16px] p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-[#EAF1F8] flex items-center justify-center text-lg font-bold text-[#1E3A8A]">
                        {member.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-[15px] truncate max-w-[150px]">{member.userName}</div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-col gap-1">
                          <span>Total Leads: <strong className="text-black">{member.leadCounts?.totalLeads || 0}</strong></span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end pl-2 border-l">
                         <span className="text-[10px] text-gray-400 font-medium">CLOSED</span>
                         <span className="text-lg font-bold text-green-600 mt-0.5">{member.leadCounts?.closedCount || 0}</span>
                    </div>
                </div>
            ))}
            {(!team.users || team.users.length === 0) && (
                <div className="col-span-full bg-white p-6 rounded-xl border text-center text-gray-500 font-medium">
                    No members assigned to this team.
                </div>
            )}
        </div>
      </div>

    </div>
  );
}
