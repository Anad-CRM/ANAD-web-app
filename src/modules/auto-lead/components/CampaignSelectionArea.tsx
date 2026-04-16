import React from 'react';
import { AutoLeadCampaign } from '../types';
import { CampaignCard } from './CampaignCard';
import { ArrowDown } from 'lucide-react';

interface Props {
  campaigns: AutoLeadCampaign[];
}

export const CampaignSelectionArea: React.FC<Props> = ({ campaigns }) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm mt-5 mx-6 flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-5 px-1">
         <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="hidden" />
            <div className="w-5 h-5 rounded-[4px] bg-[#2B5299] flex-shrink-0" />
            <span className="text-[#64748B] text-[13px] font-medium tracking-wide">Select All</span>
         </label>
         <button className="bg-[#2B5299] text-white text-[12px] px-5 py-1.5 rounded-full font-medium tracking-wide hover:bg-[#1C3A76] transition-colors">
            Clear All
         </button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 content-start pb-4">
        {campaigns.map(camp => (
          <CampaignCard key={camp.id} campaign={camp} />
        ))}
      </div>
      <div className="flex justify-center shrink-0">
        <button className="w-7 h-7 bg-[#E8EEF5] rounded-full flex items-center justify-center hover:bg-[#D4E0F0] transition-colors">
          <ArrowDown className="w-4 h-4 text-[#1C3A76]" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
