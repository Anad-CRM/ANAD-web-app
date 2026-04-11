import React from "react";

export const CallsHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 mb-6 w-full">
         <button className="flex items-center justify-center w-10 h-10 bg-[#164da3] sm:bg-[#07539B] text-white rounded-lg shadow-sm shrink-0 hover:opacity-90">
           {/* Calendar Icon */}
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
         </button>
         <button className="flex items-center gap-2 px-4 h-10 bg-[#07539B] text-white rounded-lg shadow-sm text-[13px] font-semibold transition-colors hover:bg-opacity-90">
           {/* Export Arrow */}
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
           Export Report
         </button>
    </div>
  );
};
