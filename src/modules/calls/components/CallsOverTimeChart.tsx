import React from "react";
import { Text } from "@/core/components/ui/Text";

export const CallsOverTimeChart = () => {
  return (
    <div className="flex flex-col w-full h-full font-sans">
      <Text as="h3" weight="semibold" className="text-slate-800 mb-4 ml-1" style={{ fontSize: '16px' }}>Calls Over Time</Text>
      
      <div className="bg-[#D6E4F0]/50 backdrop-blur-sm rounded-[32px] p-8 relative w-full h-[320px] flex flex-col justify-between shadow-inner border border-white/50">
        
        <div className="relative w-full h-full pb-10 pl-[32px]">
          
          {/* Y-Axis Grid Lines */}
          <div className="absolute top-0 bottom-10 left-0 w-full flex flex-col justify-between pointer-events-none">
            {[30, 20, 10, 0].map((val, idx) => (
              <div key={idx} className="flex items-center w-full h-0 relative">
                <Text weight="bold" className="text-slate-500 w-[24px] absolute left-0 text-right pr-2" style={{ fontSize: '12px' }}>{val}</Text>
                <div className="absolute left-[32px] right-0 h-[1px] bg-slate-300 opacity-50" />
              </div>
            ))}
          </div>

          {/* Lines (Mock for now, normally dynamic) */}
          <div className="absolute top-0 left-[32px] right-0 bottom-10 z-10 overflow-hidden pt-[20px]">
             <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               {/* Outgoing - Dark Blue */}
               <path d="M 0,80 L 14,30 L 28,45 L 42,40 L 56,35 L 70,25 L 84,20 L 98,15" fill="none" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
               
               {/* Incoming - Light Blue */}
               <path d="M 0,85 L 14,50 L 28,60 L 42,45 L 56,50 L 70,35 L 84,40 L 98,25" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
          </div>

          {/* X-Axis Labels */}
          <div className="absolute bottom-5 left-[32px] right-0 flex justify-between px-1">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
              <Text key={m} weight="bold" className="text-slate-500" style={{ fontSize: '12px' }}>{m}</Text>
            ))}
          </div>

        </div>

        {/* Legend */}
        <div className="flex items-center gap-8 ml-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#60A5FA] shadow-sm" />
            <Text weight="bold" className="text-slate-600" style={{ fontSize: '12px' }}>Incoming</Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1E3A8A] shadow-sm" />
            <Text weight="bold" className="text-slate-600" style={{ fontSize: '12px' }}>Outgoing</Text>
          </div>
        </div>

      </div>
    </div>
  );
};
