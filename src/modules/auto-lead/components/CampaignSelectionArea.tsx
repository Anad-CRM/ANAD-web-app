import React, { useState } from 'react';
import { AutoLeadCampaign } from '../types';
import { CampaignCard } from './CampaignCard';
import { ArrowDown, Search, Activity, CheckCircle2, CircleDot } from 'lucide-react';
import { Text } from '@/core/components/ui/Text';

interface Props {
  campaigns: AutoLeadCampaign[];
  selectedAdIds: string[];
  onToggleSelection: (adId: string) => void;
  onSelectAll: (adIds: string[]) => void;
  onClearAll: () => void;
  compact?: boolean;
}

export const CampaignSelectionArea: React.FC<Props> = ({
  campaigns,
  selectedAdIds,
  onToggleSelection,
  onSelectAll,
  onClearAll,
  compact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'selected' | 'unselected'>('all');
  const [showScrollHint, setShowScrollHint] = useState(true);

  const totalCount = campaigns.length;
  const selectedCount = campaigns.filter(c => selectedAdIds.includes(c.id)).length;
  const unselectedCount = totalCount - selectedCount;
  const totalLeadsCoverage = campaigns
    .filter(c => selectedAdIds.includes(c.id))
    .reduce((acc, c) => acc + (c.leadsCount || 0), 0);

  let filteredCampaigns = campaigns;
  if (activeFilter === 'selected') {
    filteredCampaigns = campaigns.filter(c => selectedAdIds.includes(c.id));
  } else if (activeFilter === 'unselected') {
    filteredCampaigns = campaigns.filter(c => !selectedAdIds.includes(c.id));
  }

  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    filteredCampaigns = filteredCampaigns.filter(camp => (camp.title || '').toLowerCase().includes(query));
  }

  const isAllFilteredSelected =
    filteredCampaigns.length > 0 &&
    filteredCampaigns.every(c => selectedAdIds.includes(c.id));

  const handleSelectAllToggle = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredCampaigns.map(c => c.id));
      const remainingIds = selectedAdIds.filter(id => !filteredIds.has(id));
      onSelectAll(remainingIds);
    } else {
      const newSelections = Array.from(new Set([...selectedAdIds, ...filteredCampaigns.map(c => c.id)]));
      onSelectAll(newSelections);
    }
  };

  return (
    <div
      className={
        compact
          ? 'p-0 space-y-4'
          : 'bg-white rounded-3xl p-4 sm:p-6 shadow-sm mt-4 sm:mt-5 mx-0 sm:mx-6 flex-1 flex flex-col overflow-hidden border border-gray-100/30'
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-200/50 flex items-center justify-center text-gray-500 shrink-0">
            <CircleDot className="w-4 h-4" />
          </div>
          <div>
            <Text className="text-gray-400 block uppercase tracking-wider" style={{ fontSize: '10px' }}>
              Total Active
            </Text>
            <Text weight="bold" className="text-gray-800 block" style={{ fontSize: '13px' }}>
              {totalCount} Campaigns
            </Text>
          </div>
        </div>

        <div className="bg-[#1C3A76]/5 border border-[#1C3A76]/10 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1C3A76]/10 flex items-center justify-center text-[#1C3A76] shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <Text className="text-[#1C3A76]/75 block uppercase tracking-wider" style={{ fontSize: '10px' }}>
              Selected
            </Text>
            <Text weight="bold" className="text-[#1C3A76] block" style={{ fontSize: '13px' }}>
              {selectedCount} Ads Included
            </Text>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <Text className="text-emerald-600/75 block uppercase tracking-wider" style={{ fontSize: '10px' }}>
              Lead Coverage
            </Text>
            <Text weight="bold" className="text-emerald-700 block" style={{ fontSize: '13px' }}>
              {totalLeadsCoverage.toLocaleString()} Leads
            </Text>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/40 border border-gray-100 rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="hidden"
              checked={isAllFilteredSelected}
              onChange={handleSelectAllToggle}
              disabled={filteredCampaigns.length === 0}
            />
            <div
              className={`w-5 h-5 rounded-[6px] flex-shrink-0 flex items-center justify-center transition-all ${
                isAllFilteredSelected
                  ? 'bg-[#1C3A76]'
                  : 'border-2 border-gray-300 bg-white hover:border-[#1C3A76]/50'
              } ${filteredCampaigns.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isAllFilteredSelected && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-gray-600 text-[12.5px] font-bold tracking-wide">Select Filtered</span>
          </label>

          <div className="hidden sm:block w-px h-5 bg-gray-200" />

          <div className="flex flex-wrap bg-gray-100/80 p-0.5 rounded-xl border border-gray-200/40 gap-0.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'all' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              All
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  activeFilter === 'all' ? 'bg-gray-100 text-gray-700' : 'bg-gray-200/60 text-gray-500'
                }`}
              >
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('selected')}
              className={`px-3 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'selected' ? 'bg-white text-[#1C3A76] shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Selected
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  activeFilter === 'selected'
                    ? 'bg-[#1C3A76]/10 text-[#1C3A76]'
                    : 'bg-gray-200/60 text-gray-500'
                }`}
              >
                {selectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('unselected')}
              className={`px-3 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'unselected' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Unselected
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  activeFilter === 'unselected' ? 'bg-gray-200 text-gray-700' : 'bg-gray-200/60 text-gray-500'
                }`}
              >
                {unselectedCount}
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-[200px]">
            <input
              type="text"
              placeholder="Search active ads..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-8 pr-4 text-[12.5px] focus:outline-none focus:border-[#1C3A76] text-black shadow-xs focus:ring-1 focus:ring-[#1C3A76]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={onClearAll}
            disabled={selectedCount === 0}
            className={`w-full sm:w-auto text-[12px] px-4 py-2 rounded-xl font-bold tracking-wide transition-all border shrink-0 ${
              selectedCount > 0
                ? 'bg-white border-red-200 hover:bg-red-50 text-red-600 hover:border-red-300 shadow-xs cursor-pointer'
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            Clear Selected
          </button>
        </div>
      </div>

      <div
        onScroll={e => {
          const el = e.currentTarget;
          if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
            setShowScrollHint(false);
          } else {
            setShowScrollHint(true);
          }
        }}
        className={`grid grid-cols-1 xl:grid-cols-2 gap-3 content-start custom-scrollbar ${
          compact ? 'max-h-[300px] overflow-y-auto pr-1' : 'flex-1 overflow-y-auto pr-2 pb-4'
        }`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#E2E8F0 transparent',
        }}
      >
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-10 px-4 text-center">
            <span className="text-2xl mb-2">🔍</span>
            <p className="text-gray-800 font-semibold text-[13.5px]">No campaigns found</p>
            <p className="text-gray-400 text-[11.5px] mt-0.5 max-w-[320px]">
              {searchTerm
                ? `We couldn't find any campaign matching "${searchTerm}". Try a different name.`
                : activeFilter === 'selected'
                  ? "You haven't selected any campaigns yet. Select some from the 'All' tab."
                  : 'No campaigns available in this filter.'}
            </p>
          </div>
        ) : (
          filteredCampaigns.map(camp => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              isSelected={selectedAdIds.includes(camp.id)}
              onToggle={onToggleSelection}
            />
          ))
        )}
      </div>

      {!compact && showScrollHint && filteredCampaigns.length > 4 && (
        <div className="flex justify-center shrink-0 mt-2 animate-bounce opacity-70">
          <button className="w-6 h-6 bg-[#E8EEF5] rounded-full flex items-center justify-center hover:bg-[#D4E0F0] transition-colors pointer-events-none">
            <ArrowDown className="w-3.5 h-3.5 text-[#1C3A76]" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};
