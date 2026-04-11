import React from "react";
import { AdCampaign } from "../types";

export const CampaignCard = ({ data }: { data?: AdCampaign }) => {
  return (
    <div className="flex flex-col mb-8 p-4 bg-[#F8FAFC] rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex flex-col flex-1">
          <h2 className="text-[16px] text-gray-900 font-bold leading-tight">
            {data?.name || "Athira Feedback Campaign 12.3.26"}
          </h2>
          <span className="text-[12px] text-gray-600 font-medium">
            {data?.status || "Manual"}
          </span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 ml-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        
        <div className="bg-[#EAEFF5] rounded-2xl p-4 flex flex-col justify-between h-[90px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] font-bold text-black">Clicks</span>
            <div className="text-[#233A78]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m12 8 4 4-4 4"/><path d="M8 12h8"/></svg>
            </div>
          </div>
          <span className="text-[20px] font-extrabold text-black mt-1">{data?.metrics?.clicks || "20"}</span>
        </div>

        <div className="bg-[#EAEFF5] rounded-2xl p-4 flex flex-col justify-between h-[90px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] font-bold text-black">Impressions</span>
            <div className="text-[#233A78]">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
          </div>
          <span className="text-[20px] font-extrabold text-black mt-1">{data?.metrics?.impressions || "22"}</span>
        </div>

        <div className="bg-[#EAEFF5] rounded-2xl p-4 flex flex-col justify-between h-[90px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] font-bold text-black">Leads</span>
            <div className="text-[#233A78]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <span className="text-[20px] font-extrabold text-black mt-1">{data?.metrics?.leads || "22"}</span>
        </div>

        <div className="bg-[#EAEFF5] rounded-2xl p-4 flex flex-col justify-between h-[90px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] font-bold text-black">CTR</span>
            <div className="text-[#233A78]">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
          </div>
          <span className="text-[20px] font-extrabold text-black mt-1">{data?.metrics?.ctr || "22"}</span>
        </div>

      </div>
    </div>
  );
};
