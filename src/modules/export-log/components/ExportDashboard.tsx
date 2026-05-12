'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useExportData } from '../hooks/useExportData';
import { downloadExport } from '../api/exportApi';
import { EXPORT_FORMATS, LEAD_STATUS_OPTIONS } from '../types/export.types';
import type { ExportFormat } from '../types/export.types';

type FilterKey = 'staff' | 'teams' | 'statuses' | 'ads';

interface FilterModalProps {
  title: string;
  options: { id: string; label: string; subtitle?: string }[];
  selected: string[];
  onClose: () => void;
  onApply: (selected: string[]) => void;
  showSelectAll?: boolean;
}

function FilterModal({ title, options, selected, onClose, onApply, showSelectAll }: FilterModalProps) {
  const [local, setLocal] = useState<string[]>(selected);
  const [search, setSearch] = useState('');

  const toggle = (id: string) => {
    setLocal((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredOptions = options
    .filter((opt) => (opt.label || '').toLowerCase().startsWith(search.toLowerCase()))
    .sort((a, b) => {
      const aSel = local.includes(a.id) ? 1 : 0;
      const bSel = local.includes(b.id) ? 1 : 0;
      if (aSel !== bSel) return bSel - aSel;
      return 0; 
    });

  const handleSelectAll = () => {
    const visibleIds = filteredOptions.map(opt => opt.id);
    setLocal(prev => {
      const otherIds = prev.filter(id => !visibleIds.includes(id));
      return [...otherIds, ...visibleIds];
    });
  };

  const handleClearSelection = () => {
    const visibleIds = filteredOptions.map(opt => opt.id);
    setLocal(prev => prev.filter(id => !visibleIds.includes(id)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <span className="text-[15px] font-semibold text-gray-800">{title}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-50">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#233A78]/20 focus:border-[#233A78] transition-all"
            />
            <svg
              className="absolute left-3 top-2.5 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {showSelectAll && (
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {search ? 'Filtered Results' : 'Selection'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-[#233A78] hover:underline"
                >
                  Select All
                </button>
                <button 
                  onClick={handleClearSelection}
                  className="text-[11px] font-bold text-red-500 hover:underline"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
          {filteredOptions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No results found</p>
          )}
          {filteredOptions.map((opt) => {
            const checked = local.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                  checked ? 'bg-[#233A78]/10 text-[#233A78]' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                  checked ? 'bg-[#233A78] border-[#233A78]' : 'border-gray-300'
                }`}>
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </span>
                <div className="flex flex-col">
                  <span className="truncate">{opt.label}</span>
                  {opt.subtitle && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${checked ? 'text-[#233A78]/60' : 'text-gray-400'}`}>
                      {opt.subtitle}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 px-5 pb-5 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onApply(local); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#233A78] hover:bg-[#1a2d5a] transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExportDashboard() {
  const { user } = useAuthContext();
  const { staff, teams, ads, isLoading: dataLoading } = useExportData();

  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<FilterKey | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNoDataConfirm, setShowNoDataConfirm] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  const hasFilters =
    startDate || endDate || selectedStaff.length || selectedTeams.length || selectedStatuses.length || selectedAds.length;

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedStaff([]);
    setSelectedTeams([]);
    setSelectedStatuses([]);
    setSelectedAds([]);
    setError(null);
  };

  const triggerExport = async (forceEmpty = false) => {
    setIsExporting(true);
    setError(null);
    try {
      const payload: Parameters<typeof downloadExport>[0] = {
        format,
        organizationId: user?.organizationId as string,
        staffIds: selectedStaff.length ? selectedStaff : undefined,
        teamIds: selectedTeams.length ? selectedTeams : undefined,
        statuses: selectedStatuses.length ? selectedStatuses : undefined,
        adIds: selectedAds.length ? selectedAds : undefined,
        dateRange:
          startDate && endDate
            ? { start: new Date(startDate).toISOString(), end: new Date(endDate).toISOString() }
            : undefined,
        allowEmpty: forceEmpty,
      };

      try {
        const blob = await downloadExport(payload);
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `leads_export_${dateStr}.${format}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        clearFilters();
        setShowNoDataConfirm(false); // Close modal if it was open
      } catch (err: unknown) {
        const error = err as { message?: string };
        // If we get a 404, it means no data found.
        if (error.message?.includes('404') && !forceEmpty) {
          setShowNoDataConfirm(true);
          return;
        }
        throw err;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportClick = () => {
    if (!hasFilters) {
      setShowConfirm(true);
    } else {
      triggerExport();
    }
  };

  const modalOptions: Record<FilterKey, { id: string; label: string; subtitle?: string }[]> = {
    staff: staff.map((s) => ({ id: s.id, label: s.userName, subtitle: s.role })),
    teams: teams.map((t) => ({ id: t.teamId, label: t.teamName })),
    statuses: LEAD_STATUS_OPTIONS.map((s) => ({ id: s, label: s })),
    ads: ads.map((a) => ({ id: a.adId, label: a.adName })),
  };

  const modalSetters: Record<FilterKey, (v: string[]) => void> = {
    staff: setSelectedStaff,
    teams: setSelectedTeams,
    statuses: setSelectedStatuses,
    ads: setSelectedAds,
  };

  const selectedMap: Record<FilterKey, string[]> = {
    staff: selectedStaff,
    teams: selectedTeams,
    statuses: selectedStatuses,
    ads: selectedAds,
  };

  const filterTiles: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
    {
      key: 'staff',
      label: 'Staff Members',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      key: 'teams',
      label: 'Teams',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      key: 'statuses',
      label: 'Lead Statuses',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
        </svg>
      ),
    },
    {
      key: 'ads',
      label: 'Ad Campaigns',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full h-full font-sans tracking-tight">
      {activeModal && (
        <FilterModal
          title={filterTiles.find((f) => f.key === activeModal)?.label ?? ''}
          options={modalOptions[activeModal]}
          selected={selectedMap[activeModal]}
          onClose={() => setActiveModal(null)}
          onApply={(v) => modalSetters[activeModal](v)}
          showSelectAll={activeModal === 'ads'}
        />
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-[15px] font-semibold text-gray-800 mb-2">Export All Data?</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              No filters selected. This will export ALL lead data for your organization. Do you want to proceed?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(false); triggerExport(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#233A78] hover:bg-[#1a2d5a] transition-colors"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoDataConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-[15px] font-semibold text-gray-800 mb-2">No Data Found</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              No leads match the selected filters. Do you want to download an empty data file anyway?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoDataConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { triggerExport(true); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#233A78] hover:bg-[#1a2d5a] transition-colors"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-6 lg:px-8 max-w-[1400px] mx-auto pt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Export Log</h1>
            <p className="text-sm text-gray-400 mt-0.5">Export lead data to CSV, XLSX, PDF, or XML</p>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-center w-full flex-1 px-4 pb-8">
        <div className="bg-white w-full max-w-[560px] rounded-3xl p-6 shadow-sm border border-black/5 h-fit">

          <div className="mb-6">
            <label className="block text-[13px] font-semibold text-gray-600 mb-2 uppercase tracking-wider">
              Export Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EXPORT_FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    format === f
                      ? 'bg-[#233A78] text-white border-[#233A78] shadow-md shadow-[#233A78]/20'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#233A78]/30 hover:text-[#233A78]'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
                Date Range
              </label>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-[11px] text-gray-400 font-medium absolute -top-2 left-3 bg-white px-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#233A78] focus:ring-1 focus:ring-[#233A78]/20 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="relative">
                <label className="text-[11px] text-gray-400 font-medium absolute -top-2 left-3 bg-white px-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#233A78] focus:ring-1 focus:ring-[#233A78]/20 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
                Optional Filters
              </label>
              {(selectedStaff.length || selectedTeams.length || selectedStatuses.length || selectedAds.length) ? (
                <button
                  onClick={() => { setSelectedStaff([]); setSelectedTeams([]); setSelectedStatuses([]); setSelectedAds([]); }}
                  className="text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-colors"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search filters..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#233A78]/20 focus:border-[#233A78] transition-all"
                />
                <svg
                  className="absolute left-3 top-3 text-gray-400"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
            </div>

            {dataLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#233A78] animate-spin" />
                Loading filter options…
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filterTiles
                  .filter((tile) => tile.label.toLowerCase().startsWith(filterSearch.toLowerCase()))
                  .map(({ key, label, icon }) => {
                    const count = selectedMap[key].length;
                    const active = count > 0;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveModal(key)}
                        className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-left transition-all ${
                          active
                            ? 'bg-[#233A78]/5 border-[#233A78]/20 text-[#233A78]'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-[#233A78]/30 hover:bg-[#233A78]/5 hover:text-[#233A78]'
                        }`}
                      >
                        <span className={active ? 'text-[#233A78]' : 'text-gray-400'}>{icon}</span>
                        <span className="flex-1 text-sm font-medium">{label}</span>
                        {active ? (
                          <span className="text-[11px] font-bold bg-[#233A78]/10 text-[#233A78] px-2.5 py-0.5 rounded-full">
                            {count} selected
                          </span>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                {filterTiles.filter((tile) => tile.label.toLowerCase().startsWith(filterSearch.toLowerCase())).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No categories match your search</p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleExportClick}
            disabled={isExporting}
            className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white bg-[#233A78] hover:bg-[#1a2d5a] active:scale-[0.98] transition-all shadow-md shadow-[#233A78]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Generate Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
