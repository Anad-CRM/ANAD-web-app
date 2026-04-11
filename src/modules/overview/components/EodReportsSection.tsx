import React from "react";
import { StaffEodSummary, LeadStats } from "../types";

export default function EodReportsSection({ eodData }: { eodData: StaffEodSummary[] }) {

  const statusConfig = [
    { key: "newLead", label: "New Leads", color: "bg-[#64748B]" },
    { key: "hotLead", label: "Hot Leads", color: "bg-[#0F766E]" },
    { key: "followUp", label: "Follow up", color: "bg-[#A3E635]" },
    { key: "closed", label: "close", color: "bg-[#FCD34D]" },
    { key: "notInterested", label: "Not interested", color: "bg-[#F59E0B]" },
    { key: "rnr", label: "RNR", color: "bg-[#D97706]" },
    { key: "busy", label: "Busy", color: "bg-[#B45309]" },
    { key: "switchedOff", label: "Switch Off", color: "bg-[#991B1B]" },
  ];

  const calculateWidth = (count: number, total: number) => {
    if (total === 0 || count === 0) return 0;
    return Math.max(2, Math.round((count / total) * 100));
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-[15px] font-semibold text-black mb-4">EOD Reports</h3>
      
      <div className="bg-[#233A78] rounded-2xl p-5 shadow-lg relative">
        <div className="absolute top-4 right-4 text-white">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M15 14h.01"/><path d="M15 18h.01"/><path d="M11 14h.01"/><path d="M11 18h.01"/><path d="M7 14h.01"/><path d="M7 18h.01"/></svg>
        </div>

        <div className="grid grid-cols-[300px_minmax(150px,1fr)_120px] gap-8 mb-4 px-2">
           <div/>
           <div className="text-[12px] text-white/50 text-center">Lead Statics</div>
           <div className="text-[12px] text-white/50 text-center">Call Statics</div>
        </div>

        <div className="flex flex-col gap-6">
          {(() => {
            const activeEods = eodData.filter((staff) => {
              const eod = staff.eods?.[0];
              const leadStr = eod?.leadStats?.totalLeads || 0;
              const callStr = eod?.callStats?.totalCalls || 0;
              return leadStr > 0 || callStr > 0;
            });

            if (activeEods.length === 0) {
              return (
                <div className="text-white text-center py-6 opacity-50 text-[14px]">
                  No EOD activity available for today
                </div>
              );
            }

            return activeEods.slice(0, 5).map((staff, idx) => {
            const eod = staff.eods?.[0]; 
            const leadStats = eod?.leadStats || {} as LeadStats;
            const callStats = eod?.callStats || { totalCalls: 0, totalIncomingCalls: 0, totalOutgoingCalls: 0, totalMissedCalls: 0, totalDuration: 0 };
            const totalLeads = leadStats.totalLeads || 0;

            const name = staff.userName || "Unknown";
            const pseudoAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E2B77A&color=fff&size=100`;

            return (
              <div key={idx} className="grid grid-cols-[300px_minmax(150px,1fr)_120px] gap-8 items-center px-2">
                <div className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] rounded-full bg-[#E2B77A] overflow-hidden flex-shrink-0 shadow-md">
                     <img src={pseudoAvatarUrl} width="52" height="52" alt="Avatar"/>
                  </div>
                  <div className="truncate">
                    <h4 className="text-[17px] font-bold text-white mb-0.5 truncate">{name}</h4>
                    <p className="text-[12px] text-white/60">{eod?.role || "Staff Member"}</p>
                  </div>
                </div>

                <div className="flex items-center w-full relative h-[18px]">
                  {totalLeads === 0 ? (
                    <div className="w-full bg-[#1C2C5E] h-full rounded-full flex items-center justify-center text-[9px] font-bold text-white/30">
                      No Data
                    </div>
                  ) : (
                    statusConfig.map((config, sIdx) => {
                      const count = (leadStats as any)[config.key] || 0;
                      if (count === 0) return null;
                      const widthPct = calculateWidth(count, totalLeads);

                      return (
                        <div 
                          key={config.key} 
                          style={{ width: `${widthPct}%` }}
                          className={`${config.color} h-full flex items-center justify-center text-[9px] font-bold text-white overflow-hidden border-r border-[#64748B] last:border-none`}
                        >
                          {count}
                        </div>
                      );
                    })
                  )}
                </div>
                
                <div className="flex items-center justify-between text-white/80">
                  <div className="flex flex-col items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <span className="text-[12px]">{callStats.totalOutgoingCalls || 0}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span className="text-[12px]">{callStats.totalIncomingCalls || 0}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span className="text-[12px]">{callStats.totalCalls || 0}</span>
                  </div>
                </div>
              </div>
            );
          })
        })()}
      </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-white/50 px-2 pb-1 gap-2">
          <div className="flex flex-wrap gap-4">
            {statusConfig.map(s => (
               <div key={s.label} className="flex items-center gap-1.5 whitespace-nowrap">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.color}`}/>{s.label}
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
