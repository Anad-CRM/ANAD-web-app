import React from 'react';
import { AutoLeadCampaign } from '../types';
import { BarChart2 } from 'lucide-react';

interface Props {
  campaign: AutoLeadCampaign;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const CampaignCard: React.FC<Props> = ({ campaign, isSelected, onToggle }) => {
  return (
    <div 
      onClick={() => onToggle(campaign.id)}
      className={`relative rounded-2xl p-4 flex flex-col justify-between h-[105px] border-2 transition-all cursor-pointer ${
        isSelected ? 'bg-white border-[#1C3A76] shadow-md shadow-[#1C3A76]/5' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Platform Badge */}
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
        isSelected ? 'bg-[#1C3A76] text-white' : 'bg-white text-gray-400 border border-gray-100'
      }`}>
        {campaign.platform || 'MANUAL'}
      </div>

      <div className="flex items-start gap-2.5">
        {/* Custom Checkbox */}
        <div className={`w-5 h-5 rounded-[5px] flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
          isSelected ? 'bg-[#1C3A76]' : 'border-2 border-gray-300 bg-white'
        }`}>
          {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </div>
        
        <p className={`text-[14px] font-semibold leading-snug line-clamp-2 mt-px ${
          isSelected ? 'text-gray-900' : 'text-gray-600'
        }`}>
          {campaign.title}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 opacity-60">
          <BarChart2 className="w-3.5 h-3.5 text-[#1C3A76]" />
          <span className="text-[12px] font-medium text-gray-500">Leads</span>
        </div>
        <span className="font-bold text-[14px] text-[#1C3A76]">{campaign.leadsCount}</span>
      </div>
    </div>
  );
};
