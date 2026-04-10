"use client";

import React from "react";

export default function OverviewPage() {
  return (
    <div className="flex flex-col max-w-5xl">
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
          { title: "Performer of the Month", name: "Nick O", team: "Sales Team" },
          { title: "Performer of the Week", name: "Nick O", team: "Sales Team" }
        ].map((card, idx) => (
          <div key={idx} className="flex-1 bg-[#D6E4F0] rounded-2xl p-6 flex items-center gap-6 shadow-sm">
            <div className="w-[84px] h-[84px] rounded-full bg-[#233A78] flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[17px] font-bold text-[#1E293B] mb-2">{card.title}</h3>
              <p className="text-[16px] text-gray-700">
                Name : <span className="font-bold text-black">{card.name}</span> <span className="text-[#22C55E] ml-1">{card.team}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8 items-center h-[180px]">
        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] h-full flex items-center justify-center gap-10">
          <div className="relative w-[120px] h-[120px] rounded-full border-[18px] border-r-transparent border-[#233A78] flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-[-18px] rounded-full border-[18px] border-t-transparent border-l-transparent border-b-[#A5BCD1] border-r-[#A5BCD1] rotate-45" />
            <div className="absolute inset-[-18px] top-auto h-[18px] rounded-b-full overflow-hidden">
               <div className="w-full h-full bg-[#E2E8F0]" />
            </div>
            
            <div className="text-center z-10 flex flex-col items-center">
              <span className="text-[20px] font-extrabold text-black leading-none">320</span>
              <span className="text-[10px] text-gray-500 whitespace-nowrap leading-none mt-1">Total leads</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {[
              { label: "New Lead", count: "100", trend: "+20%", color: "bg-[#233A78]" },
              { label: "Hot Lead", count: "40", trend: "+5%", color: "bg-[#4B73B2]" },
              { label: "Registered", count: "26", trend: "+5%", color: "bg-[#93B0D6]" },
              { label: "Enrolled", count: "38", trend: "+5%", color: "bg-[#F1F5F9]" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${stat.color} shadow-sm`} />
                <span className="text-[13px] text-gray-700 w-20">{stat.label}</span>
                <span className="text-[13px] font-bold text-black w-8">{stat.count}</span>
                <span className="text-[13px] text-black w-10">{stat.trend}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 h-full">
          <div className="w-[180px] bg-[#D6E4F0] rounded-2xl p-6 flex flex-col justify-center items-center shadow-sm">
            <span className="text-[14px] font-bold text-black self-start mb-2">All Leads</span>
            <div className="flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-[#233A78]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span className="text-[36px] font-extrabold text-black leading-none">700</span>
            </div>
          </div>

          <div className="w-[180px] bg-[#D6E4F0] rounded-2xl p-6 flex flex-col justify-center items-center shadow-sm">
            <span className="text-[14px] font-bold text-black self-start mb-2">Unassigned</span>
            <div className="flex items-center gap-3">
               <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#233A78]"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span className="text-[36px] font-extrabold text-black leading-none">700</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="text-[15px] font-semibold text-black mb-4">EOD Reports</h3>
        
        <div className="bg-[#233A78] rounded-2xl p-5 shadow-lg relative">
          <div className="absolute top-4 right-4 text-white">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M15 14h.01"/><path d="M15 18h.01"/><path d="M11 14h.01"/><path d="M11 18h.01"/><path d="M7 14h.01"/><path d="M7 18h.01"/></svg>
          </div>

          <div className="grid grid-cols-[300px_minmax(300px,1fr)_120px] gap-8 mb-4 px-2">
             <div/>
             <div className="text-[12px] text-white/50 text-center">Lead Statics</div>
             <div className="text-[12px] text-white/50 text-center">Call Statics</div>
          </div>

          <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[300px_minmax(300px,1fr)_120px] gap-8 items-center px-2">
                <div className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] rounded-full bg-[#E2B77A] overflow-hidden flex-shrink-0 shadow-md">
                     <img src="https://ui-avatars.com/api/?name=Nick+D&background=E2B77A&color=fff&size=100" width="52" height="52" alt="Avatar"/>
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-white mb-0.5">Nick D</h4>
                    <p className="text-[12px] text-white/60">Staff Member</p>
                  </div>
                </div>

                <div className="flex items-center w-full relative h-[18px]">
                  <div className="w-[8%] bg-[#64748B] h-full rounded-l-full flex items-center justify-center text-[9px] font-bold text-white">12</div>
                  <div className="w-[5%] bg-[#0F766E] h-full flex items-center justify-center text-[9px] font-bold text-white">12</div>
                  <div className="w-[10%] bg-[#A3E635] h-full flex items-center justify-center text-[9px] font-bold text-black border-r border-[#64748B]">23</div>
                  <div className="w-[20%] bg-[#FCD34D] h-full flex items-center justify-center text-[9px] font-bold text-black border-r border-[#64748B]">43</div>
                  <div className="w-[12%] bg-[#F59E0B] h-full flex items-center justify-center text-[9px] font-bold text-white border-r border-[#64748B]">11</div>
                  <div className="w-[12%] bg-[#D97706] h-full flex items-center justify-center text-[9px] font-bold text-white border-r border-[#64748B]">13</div>
                  <div className="w-[12%] bg-[#B45309] h-full flex items-center justify-center text-[9px] font-bold text-white border-r border-[#64748B]">13</div>
                  <div className="w-[21%] bg-[#991B1B] h-full rounded-r-full flex items-center justify-center text-[9px] font-bold text-white">18</div>
                </div>
                
                <div className="flex items-center justify-between text-white/80">
                  <div className="flex flex-col items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <span className="text-[12px]">123</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span className="text-[12px]">108</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span className="text-[12px]">153</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 px-2 pb-1">
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#64748B]"/>New Leads</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"/>Hot Leads</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#A3E635]"/>Follow up</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#FCD34D]"/>close</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"/>Not interested</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#D97706]"/>RNR</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#B45309]"/>Busy</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#991B1B]"/>Switch Off</div>
            </div>
            <button className="text-white hover:underline bg-transparent border-none text-[12px] cursor-pointer flex items-center gap-1">
              View More <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
