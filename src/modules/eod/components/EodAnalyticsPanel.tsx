import React from "react";
import { EodStaffMember } from "../types";

export const EodAnalyticsPanel = ({ data }: { data: EodStaffMember | null }) => {
  const leadMetrics = [
    { label: "New Lead", count: data?.leadStats?.newLeads || 0, color: "#94A3B8" },
    { label: "Hot lead", count: data?.leadStats?.hotLeads || 0, color: "#CBD5E1" },
    { label: "Follow up", count: data?.leadStats?.followUps || 0, color: "#94A3B8" },
    { label: "Closed", count: data?.leadStats?.closedLeads || 0, color: "#64748B" },
    { label: "Not interested", count: data?.leadStats?.notInterested || 0, color: "#475569" },
    { label: "RNR", count: data?.leadStats?.rnr || 0, color: "#94A3B8" },
    { label: "Busy", count: data?.leadStats?.busy || 0, color: "#CBD5E1" },
    { label: "Switch off", count: data?.leadStats?.switchOff || 0, color: "#94A3B8" },
    { label: "In eligible", count: 0, color: "#94A3B8" },
    { label: "Registered", count: data?.leadStats?.registered || 0, color: "#CBD5E1" },
  ];

  const callMetrics = [
    { label: "Incoming", count: data?.callStats?.totalIncomingCalls || 0, icon: "incoming" },
    { label: "Outgoing", count: data?.callStats?.totalOutgoingCalls || 0, icon: "outgoing" },
    { label: "Missed", count: data?.callStats?.totalMissedCalls || 0, icon: "missed" },
    { label: "Incoming", count: 0, icon: "incoming" },
    { label: "Incoming", count: 0, icon: "incoming" },
    { label: "Incoming", count: 0, icon: "incoming" },
  ];

  const maxLeadCount = Math.max(...leadMetrics.map(m => m.count), 1);
  const totalLeads = leadMetrics.reduce((sum, m) => sum + m.count, 0);
  const totalCalls = callMetrics.reduce((sum, m) => sum + m.count, 0);

  if (!data || (totalLeads === 0 && totalCalls === 0)) {
    return (
      <div className="flex flex-col flex-1 h-full bg-[#233A78] rounded-[24px] p-6 text-white font-sans shadow-xl items-center justify-center opacity-90 border border-white/10">
        <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md flex flex-col items-center text-center max-w-[300px]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-50"><path d="M21 21L15 15"/><circle cx="11" cy="11" r="8"/></svg>
          <h3 className="text-[18px] font-bold mb-2">No data recorded</h3>
          <p className="text-[13px] text-white/60">This staff member hasn&apos;t recorded any activity leads or calls for today yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-[#233A78] rounded-[24px] p-6 text-white font-sans shadow-xl overflow-y-auto">
      
      <div className="flex flex-col flex-1 mb-8">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-6 bg-white/20 rounded-md backdrop-blur-sm" />
            <h2 className="text-[20px] font-bold">Total Leads</h2>
        </div>

        <div className="flex-1 flex items-end justify-between px-2 min-h-[220px]">
           {leadMetrics.map((lead, idx) => (
             <div key={idx} className="flex flex-col items-center gap-4 group">
               <div className="relative flex flex-col items-center justify-end h-[180px] w-[26px]">
                  <div 
                    className="w-full bg-white/90 rounded-t-full rounded-b-full transition-all duration-700 ease-out flex items-center justify-center"
                    style={{ height: `${Math.max((lead.count / maxLeadCount) * 100, 10)}%` }}
                  >
                    <span className="transform -rotate-90 text-[10px] text-gray-800 font-bold">{lead.count}</span>
                  </div>
               </div>
               <span className="text-[9px] font-bold text-white/70 uppercase tracking-tighter whitespace-nowrap overflow-hidden text-center w-full">
                 {lead.label.split(' ').join('\n')}
               </span>
             </div>
           ))}
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-white/20 rounded-md backdrop-blur-sm" />
            <h2 className="text-[20px] font-bold">Total Calls</h2>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {callMetrics.map((call, idx) => (
             <div key={idx} className="bg-white/90 rounded-xl p-3 flex flex-col items-center justify-center text-gray-800 shadow-sm transition-transform hover:scale-105 cursor-pointer">
                <span className="text-[15px] font-extrabold mb-1">{call.count}</span>
                <div className="text-gray-600 mb-1">
                  {call.icon === "incoming" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                  {call.icon === "outgoing" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                  {call.icon === "missed" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-400">{call.label}</span>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
};
