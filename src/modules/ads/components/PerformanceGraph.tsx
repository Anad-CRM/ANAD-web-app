import React from "react";

export const PerformanceGraph = () => {
  return (
    <div className="flex flex-col w-full">
      <h2 className="text-[16px] font-extrabold text-black mb-3">Ad Performance Graph</h2>
      
      <div className="bg-[#EAEFF5] rounded-3xl p-6 relative w-full h-[300px]">
        <div className="absolute top-4 right-4 bg-[#233A78] text-white text-[12px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm">
          Clicks
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <div className="absolute bottom-10 left-8 right-8 top-16 flex items-end justify-between border-b-2 border-black border-l-2 pl-4 pr-2 pt-4">
            
            <div className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                <div className="w-10 bg-[#233A78] h-[80%] opacity-100 flex items-end justify-center pb-2">
                    <span className="transform -rotate-90 text-[11px] font-bold">69%</span>
                </div>
                <span className="absolute -bottom-6 text-black text-[12px] font-medium">Jan</span>
            </div>

            <div className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                <div className="w-10 bg-[#35539C] h-[60%] opacity-100 flex items-end justify-center pb-2">
                    <span className="transform -rotate-90 text-[11px] font-bold">54%</span>
                </div>
                <span className="absolute -bottom-6 text-black text-[12px] font-medium">Feb</span>
            </div>

            <div className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                <div className="w-10 bg-[#4B73B2] h-[40%] opacity-100 flex items-end justify-center pb-2">
                    <span className="transform -rotate-90 text-[11px] font-bold">36%</span>
                </div>
                <span className="absolute -bottom-6 text-black text-[12px] font-medium">Mar</span>
            </div>

            <div className="relative flex flex-col items-center justify-end w-12 h-full text-white">
                <div className="w-10 bg-[#5A8BE6] h-[50%] opacity-100 flex items-end justify-center pb-2">
                    <span className="transform -rotate-90 text-[11px] font-bold">45%</span>
                </div>
                <span className="absolute -bottom-6 text-black text-[12px] font-medium">Apr</span>
            </div>

        </div>
      </div>
    </div>
  );
};
