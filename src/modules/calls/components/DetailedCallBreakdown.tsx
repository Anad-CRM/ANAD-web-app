import React from "react";
import { CallTeamRow } from "../types";

export const DetailedCallBreakdown = ({ data, isLoading }: { data: CallTeamRow[], isLoading: boolean }) => {
  return (
    <div className="flex flex-col w-full mt-6 font-sans">
      <h2 className="text-[18px] font-medium text-black mb-4">Detailed Call Breakdown</h2>
      
      <div className="w-full">
         
         <div className="bg-[#233A78] text-white rounded-t-3xl sm:rounded-t-[32px] sm:rounded-b-[12px] px-8 py-3.5 mb-4 grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] items-center text-center shadow-sm text-[15px]">
            <div className="text-left font-medium">Sales Team</div>
            <div className="font-medium">Call made</div>
            <div className="font-medium">Received</div>
            <div className="font-medium">Missed</div>
            <div className="font-medium">Avg Duration</div>
         </div>

         <div className="flex flex-col gap-3 pb-8">
            {isLoading ? (
              <div className="h-40 flex items-center justify-center text-gray-500 bg-[#EAEFF5] rounded-2xl animate-pulse">
                Fetching call metrics...
              </div>
            ) : data.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-500 bg-[#EAEFF5] rounded-2xl">
                No call data found for this period.
              </div>
            ) : (
              data.map((row) => (
                  <div key={row.id} className="bg-[#3561A5] text-white rounded-2xl p-3 px-8 grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] items-center text-center transition-transform hover:scale-[1.01]">
                      
                      <div className="flex items-center gap-4 text-left">
                          <div className="w-[42px] h-[42px] min-w-[42px] bg-white rounded-full overflow-hidden shadow-sm flex items-center justify-center">
                              {row.avatarUrl ? (
                                  <img src={row.avatarUrl} alt={row.name} className="w-full h-full object-cover" />
                              ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              )}
                          </div>
                          <span className="text-[17px] tracking-wide font-normal">{row.name}</span>
                      </div>

                      <div className="text-[16px] xl:text-[18px]">{row.callsMade}</div>
                      <div className="text-[16px] xl:text-[18px]">{row.received}</div>
                      <div className="text-[16px] xl:text-[18px]">{row.missed}</div>
                      <div className="text-[16px] xl:text-[18px] tracking-widest">{row.avgDuration}</div>
                  </div>
              ))
            )}
         </div>

      </div>
    </div>
  );
};
