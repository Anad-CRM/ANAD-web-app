import React from "react";

export const CallsStatusChart = () => {
  return (
    <div className="flex flex-col w-full h-full pl-0 sm:pl-8">
      <h3 className="text-[14px] font-medium text-black mb-3">Calls Status</h3>
      
      <div className="relative w-full h-[220px] flex flex-col justify-end border-b-2 border-black border-l-2 pl-6 pr-6 pt-4 pb-0 mb-6">
            
        <div className="w-full h-full flex items-end justify-between px-4">
            <div className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                <div className="w-10 bg-[#233A78] h-[85%] flex items-end justify-center pb-2">
                    <span className="transform -rotate-90 text-[11px] font-bold">69%</span>
                </div>
            </div>

            <div className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                <div className="w-10 bg-[#325A9E] h-[65%] flex items-end justify-center pb-2">
                    <span className="transform -rotate-90 text-[11px] font-bold">54%</span>
                </div>
            </div>

            <div className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                <div className="w-10 bg-[#5387D1] h-[45%] flex items-end justify-center pb-2">
                    <span className="transform -rotate-90 text-[11px] font-bold">36%</span>
                </div>
            </div>

            <div className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                <div className="w-10 bg-[#6E9DF0] h-[58%] flex items-end justify-center pb-2">
                    <span className="transform -rotate-90 text-[11px] font-bold">45%</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-4 max-w-[280px]">
         <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-[#233A78]" />
             <span className="text-[14px] text-gray-800">Connected</span>
         </div>
         <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-[#6EA0FE]" />
             <span className="text-[14px] text-gray-800">Incoming</span>
         </div>
         <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-[#3561A5]" />
             <span className="text-[14px] text-gray-800">Missed</span>
         </div>
         <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-[#7CAAFC]" />
             <span className="text-[14px] text-gray-800">Outgoing</span>
         </div>
      </div>
    </div>
  );
};
