import React from "react";
import { CallTeamRow } from "../types";

export const DetailedCallBreakdown = ({ data }: { data: CallTeamRow[] }) => {
  return (
    <div className="flex flex-col w-full mt-6">
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
            {data.map((row) => (
                <div key={row.id} className="bg-[#3561A5] text-white rounded-2xl p-3 px-8 grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] items-center text-center transition-transform hover:scale-[1.01]">
                    
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-[42px] h-[42px] min-w-[42px] bg-white rounded-full overflow-hidden shadow-sm flex items-center justify-center">
                            {row.avatarUrl ? (
                                <img src={row.avatarUrl} alt={row.name} className="w-full h-full object-cover" />
                            ) : null}
                        </div>
                        <span className="text-[17px] tracking-wide font-normal">{row.name}</span>
                    </div>

                    <div className="text-[16px] xl:text-[18px]">{row.callsMade}</div>
                    <div className="text-[16px] xl:text-[18px]">{row.received}</div>
                    <div className="text-[16px] xl:text-[18px]">{row.missed}</div>
                    <div className="text-[16px] xl:text-[18px] tracking-widest">{row.avgDuration}</div>
                </div>
            ))}
         </div>

      </div>
    </div>
  );
};
