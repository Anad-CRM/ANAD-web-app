import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { AutoLeadCampaign } from '../types';

interface Props {
  title: string;
  subtitle: string;
  campaigns: AutoLeadCampaign[];
  initialSelectedIds: string[];
  isLoading?: boolean;
  onClose: () => void;
  onApply: (selectedIds: string[]) => Promise<void>;
}

export const DistributionAssignModal: React.FC<Props> = ({
  title,
  subtitle,
  campaigns,
  initialSelectedIds,
  isLoading,
  onClose,
  onApply,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  const filtered = campaigns.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const aS = selectedIds.includes(a.id);
    const bS = selectedIds.includes(b.id);
    return aS === bS ? 0 : aS ? -1 : 1;
  });

  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.includes(c.id));

  const toggleId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filtered.map(c => c.id).includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...filtered.map(c => c.id)])]);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply(selectedIds);
      onClose();
    } catch {
    } finally {
      setApplying(false);
    }
  };

  const hasChanges = JSON.stringify([...selectedIds].sort()) !== JSON.stringify([...initialSelectedIds].sort());

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="w-2 h-8 rounded-full bg-[#1C3A76]" />
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-black truncate">{title}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Search + Select All */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative mb-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full border border-gray-200 rounded-full py-2 pl-9 pr-4 text-[13px] focus:outline-none focus:border-[#1C3A76] text-black"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer" onClick={handleSelectAll}>
              <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-colors ${allSelected ? 'bg-[#1C3A76]' : 'border-2 border-gray-300'}`}>
                {allSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className="text-[13px] text-gray-500 font-medium">Select All</span>
            </label>
            <span className="text-[12px] text-[#1C3A76] font-medium">{selectedIds.length} selected</span>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#1C3A76] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No campaigns found</p>
          ) : sorted.map(camp => {
            const isSelected = selectedIds.includes(camp.id);
            return (
              <div
                key={camp.id}
                onClick={() => toggleId(camp.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-[1.5px] cursor-pointer transition-all ${
                  isSelected ? 'bg-[#EEF3FC] border-[#1C3A76]/40 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                  isSelected ? 'bg-[#1C3A76]/10 text-[#1C3A76]' : 'bg-gray-100 text-gray-500'
                }`}>
                  {camp.platform ? camp.platform.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-800 truncate">{camp.title}</p>
                  <p className="text-[11px] text-gray-400">{camp.leadsCount} leads</p>
                </div>
                <div className={`w-6 h-6 rounded-[5px] flex-shrink-0 flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-[#1C3A76]' : 'border-2 border-gray-300'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100">
          <button
            onClick={handleApply}
            disabled={!hasChanges || applying}
            className={`w-full py-3.5 rounded-2xl font-semibold text-[14px] transition-all ${
              hasChanges && !applying
                ? 'bg-[#1C3A76] text-white shadow-lg shadow-[#1C3A76]/20 hover:shadow-xl'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {applying ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Applying...
              </span>
            ) : selectedIds.length === 0 ? 'Clear Assignment' : `Assign ${selectedIds.length} Ad${selectedIds.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};
