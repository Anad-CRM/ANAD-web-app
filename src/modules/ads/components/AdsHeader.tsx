import React from "react";

export const AdsHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 mb-6 w-full">
         <span className="text-[14px] text-gray-800 font-medium mr-1">Instagram</span>
         <button className="flex items-center justify-center w-10 h-10 bg-[#233A78] text-white rounded-lg shadow-sm shrink-0">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
         </button>
         <button className="flex items-center justify-center w-10 h-10 bg-[#233A78] text-white rounded-lg shadow-sm shrink-0">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
         </button>
         <button className="flex items-center gap-2 px-4 h-10 bg-[#233A78] text-white rounded-lg shadow-sm text-[13px] font-medium transition-colors hover:bg-opacity-90">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
           Export Report
         </button>
    </div>
  );
};
