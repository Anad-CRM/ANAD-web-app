import React from "react";

export const DistributionInfoCard: React.FC = () => {
  return (
    <div className="bg-[#2B5299] rounded-2xl w-full h-[180px] flex flex-col overflow-hidden shadow-sm relative">
      <div className="p-5 flex-1 pr-10">
        <h3 className="text-white text-[15px] font-medium mb-4 tracking-wide">How The Smart Distribution Works</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
             <div className="w-[5px] h-[5px] rounded-full border border-white bg-transparent mt-1.5 flex-shrink-0" />
             <div>
               <p className="text-white text-sm font-medium">Filter Present Staff</p>
               <p className="text-white/80 text-[11px]">system First Checks which team members are present today</p>
             </div>
          </li>
          <li className="flex items-start gap-3">
             <div className="w-[5px] h-[5px] rounded-full border border-white bg-transparent mt-1.5 flex-shrink-0" />
             <div>
               <p className="text-white text-sm font-medium">Filter Present Staff</p>
               <p className="text-white/80 text-[11px]">system First Checks which team members are present today</p>
             </div>
          </li>
        </ul>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-black/20 rounded-full flex flex-col justify-start items-center p-[1px]">
           <button className="w-1.5 h-4 bg-white/90 rounded-full" />
        </div>
      </div>
      <div className="bg-white/95 px-5 py-2.5">
        <p className="text-[#1A1A1A] text-xs font-semibold">Example :</p>
      </div>
    </div>
  );
};
