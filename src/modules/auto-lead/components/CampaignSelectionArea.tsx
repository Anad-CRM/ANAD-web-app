import React, { useState } from 'react';
import { AutoLeadCampaign } from '../types';
import { CampaignCard } from './CampaignCard';
import { ArrowDown, Search } from 'lucide-react';

interface Props {
  campaigns: AutoLeadCampaign[];
  selectedAdIds: string[];
  onToggleSelection: (adId: string) => void;
  onSelectAll: (adIds: string[]) => void;
  onClearAll: () => void;
  compact?: boolean;
}

export const CampaignSelectionArea: React.FC<Props> = ({ campaigns, selectedAdIds, onToggleSelection, onSelectAll, onClearAll, compact }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = campaigns.filter(camp => {
    if (!searchTerm) return true;
    const lowerQuery = searchTerm.toLowerCase();
    const campTitle = (camp.title || '').toLowerCase();
    return campTitle.includes(lowerQuery);
  });

  return (
    <div className={compact ? 'p-4' : 'bg-white rounded-3xl p-5 shadow-sm mt-5 mx-6 flex-1 flex flex-col overflow-hidden'}>
      <div className="flex justify-between items-center mb-5 px-1">
         <label className="flex items-center gap-3 cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={filteredCampaigns.length > 0 && filteredCampaigns.every(c => selectedAdIds.includes(c.id))}
              onChange={() => {
                if (filteredCampaigns.length > 0 && filteredCampaigns.every(c => selectedAdIds.includes(c.id))) {
                  onClearAll();
                } else {
                  onSelectAll(filteredCampaigns.map(c => c.id));
                }
              }}
            />
            <div className={`w-5 h-5 rounded-[4px] flex-shrink-0 flex items-center justify-center ${filteredCampaigns.length > 0 && filteredCampaigns.every(c => selectedAdIds.includes(c.id)) ? 'bg-[#2B5299]' : 'border-2 border-gray-300'}`}>
               {filteredCampaigns.length > 0 && filteredCampaigns.every(c => selectedAdIds.includes(c.id)) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-[#64748B] text-[13px] font-medium tracking-wide">Select All</span>
         </label>
         
         <div className="flex-1 max-w-[300px] mx-4 relative">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-1.5 pl-9 pr-4 text-[13px] focus:outline-none focus:border-[#1C3A76] text-black shadow-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
         </div>

         <button 
            onClick={onClearAll}
            className="bg-[#2B5299] text-white text-[12px] px-5 py-1.5 rounded-full font-medium tracking-wide shrink-0 hover:bg-[#1C3A76] transition-colors">
            Clear All
         </button>
      </div>
      <div className={`grid grid-cols-1 xl:grid-cols-2 gap-3 content-start ${compact ? 'max-h-[320px] overflow-y-auto pr-1' : 'flex-1 overflow-y-auto pr-2 pb-4'}`}>
        {filteredCampaigns.length === 0 ? (
          <p className="col-span-2 text-center text-gray-400 text-sm py-6">No campaigns match your search</p>
        ) : filteredCampaigns.map(camp => (
          <CampaignCard 
            key={camp.id} 
            campaign={camp} 
            isSelected={selectedAdIds.includes(camp.id)}
            onToggle={onToggleSelection}
          />
        ))}
      </div>
      {!compact && (
        <div className="flex justify-center shrink-0 mt-3">
          <button className="w-7 h-7 bg-[#E8EEF5] rounded-full flex items-center justify-center hover:bg-[#D4E0F0] transition-colors">
            <ArrowDown className="w-4 h-4 text-[#1C3A76]" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};
