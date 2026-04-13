import React from 'react';
import { AutoLeadCampaign } from '../types';
import { BarChart2 } from 'lucide-react';

interface Props {
  campaign: AutoLeadCampaign;
}

export const CampaignCard: React.FC<Props> = ({ campaign }) => {
  return (
    <div className="bg-[#2B5299] rounded-2xl p-4 lg:p-5 flex flex-col justify-between h-[110px] relative shadow-sm">
      <div className="absolute top-3 right-3 bg-[#11234D]/80 text-[#94A3B8] text-[11px] px-3 py-1 rounded-full font-medium tracking-wide">
        Manual
      </div>
      <div className="flex items-start gap-3.5 mt-1">
        <label className="flex items-center justify-center cursor-pointer">
           <input type="checkbox" className="hidden" />
           <div className="w-5 h-5 bg-white/90 rounded-[4px] border-none flex-shrink-0 shrink-0" />
        </label>
        <p className="text-white text-[15px] font-normal leading-snug pr-12 line-clamp-2 mt-0.5 tracking-wide">{campaign.title}</p>
      </div>
      <div className="flex items-center justify-end text-white/90 gap-1.5 w-full">
         <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
         <span className="font-light text-[15px] tracking-wide">{campaign.leadsCount} Leads</span>
      </div>
    </div>
  );
};
