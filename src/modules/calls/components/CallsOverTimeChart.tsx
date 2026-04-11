import React from "react";

export const CallsOverTimeChart = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <h3 className="text-[14px] font-medium text-black mb-2">Calls Over Time</h3>
      
      <div className="bg-[#EAEFF5] rounded-[24px] p-6 relative w-full h-[280px] flex flex-col justify-between">
        
        <div className="relative w-full h-full pb-8 pl-[18px]">
          
          <div className="absolute top-0 bottom-8 left-0 w-full flex flex-col justify-between">
            {[30, 20, 10, 0].map((val, idx) => (
              <div key={idx} className="flex items-center w-full h-0 relative">
                <span className="text-[10px] text-black font-medium w-[15px] absolute left-0 text-right">{val}</span>
                <div className="w-[1px] h-[1px]" />
                <div className="absolute left-[24px] right-0 h-[1.5px] bg-[#3B4D5F] opacity-70" />
              </div>
            ))}
          </div>

          <div className="absolute top-0 left-[24px] right-0 bottom-8 z-10 overflow-hidden pt-[18px]">
             <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               <path d="M 0,85 L 15,65 L 30,55 L 45,75 L 60,75 L 80,40 L 98,25" fill="none" stroke="#233A78" strokeWidth="2.5" />
             </svg>
             <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               <path d="M 0,90 L 15,70 L 30,75 L 45,60 L 60,65 L 80,45 L 98,35" fill="none" stroke="#2D5A9C" strokeWidth="2.5" />
             </svg>
          </div>

          <div className="absolute bottom-4 left-[24px] right-0 flex justify-between">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
              <span key={m} className="text-[10px] font-medium text-black px-1">{m}</span>
            ))}
          </div>

        </div>

        <div className="flex items-center gap-6 mt-[-10px] ml-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#233A78]" />
            <span className="text-[11px] font-medium text-black">Incoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3561A5]" />
            <span className="text-[11px] font-medium text-black">Outgoing</span>
          </div>
        </div>

      </div>
    </div>
  );
};
