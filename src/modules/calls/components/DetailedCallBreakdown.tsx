import React from "react";
import Image from "next/image";
import { Text } from "@/core/components/ui/Text";
import { CallTeamRow } from "../types";

export const DetailedCallBreakdown = ({ data, isLoading }: { data: CallTeamRow[], isLoading: boolean }) => {
  return (
    <div className="flex flex-col w-full mt-6 font-sans">
      <Text as="h2" weight="medium" className="text-black mb-4" style={{ fontSize: '18px' }}>Detailed Call Breakdown</Text>
      
      <div className="w-full">
         
         <div className="bg-[#1E3A8A] text-white rounded-full px-10 py-4 mb-6 grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] items-center text-center shadow-lg tracking-wide uppercase">
            <Text weight="bold" className="text-left" style={{ fontSize: '14px' }}>Sales Team</Text>
            <Text weight="bold" style={{ fontSize: '14px' }}>Call made</Text>
            <Text weight="bold" style={{ fontSize: '14px' }}>Received</Text>
            <Text weight="bold" style={{ fontSize: '14px' }}>Missed</Text>
            <Text weight="bold" style={{ fontSize: '14px' }}>Avg Duration</Text>
         </div>

         <div className="flex flex-col gap-4 pb-4 max-h-[380px] overflow-y-auto custom-scrollbar-table pr-2">
            {isLoading ? (
              <div className="h-40 flex items-center justify-center text-slate-400 bg-slate-100/50 rounded-[32px] animate-pulse border border-dashed border-slate-200">
                <Text weight="medium" size="sm">Fetching call metrics...</Text>
              </div>
            ) : data.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-400 bg-slate-100/50 rounded-[32px] border border-dashed border-slate-200">
                <Text weight="medium" size="sm">No call data found for this period.</Text>
              </div>
            ) : (
              data.map((row) => (
                  <div key={row.id} className="bg-[#3561A5] text-white rounded-[24px] p-4 px-10 grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] items-center text-center transition-all hover:translate-x-1 hover:shadow-md active:scale-[0.99] group">
                      
                      <div className="flex items-center gap-5 text-left">
                          <div className="w-[48px] h-[48px] min-w-[48px] bg-white rounded-full overflow-hidden shadow-inner flex items-center justify-center p-0.5">
                              {row.avatarUrl ? (
                                  <Image src={row.avatarUrl} alt={row.name} width={48} height={48} className="w-full h-full object-cover rounded-full" unoptimized />
                              ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 rounded-full">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                              )}
                          </div>
                          <Text weight="semibold" className="tracking-wide group-hover:text-blue-100 transition-colors" style={{ fontSize: '18px' }}>{row.name}</Text>
                      </div>

                      <Text weight="bold" style={{ fontSize: '18px' }}>{row.callsMade}</Text>
                      <Text weight="bold" style={{ fontSize: '18px' }}>{row.received}</Text>
                      <Text weight="bold" style={{ fontSize: '18px' }}>{row.missed}</Text>
                      <Text weight="bold" className="tabular-nums tracking-tighter" style={{ fontSize: '18px' }}>{row.avgDuration}</Text>
                  </div>
              ))
            )}
         </div>
         <style jsx>{`
            .custom-scrollbar-table::-webkit-scrollbar {
              width: 5px;
            }
            .custom-scrollbar-table::-webkit-scrollbar-track {
              background: #F1F5F9;
              border-radius: 20px;
            }
            .custom-scrollbar-table::-webkit-scrollbar-thumb {
              background: #CBD5E1;
              border-radius: 20px;
            }
            .custom-scrollbar-table::-webkit-scrollbar-thumb:hover {
              background: #94A3B8;
            }
         `}</style>

      </div>
    </div>
  );
};
