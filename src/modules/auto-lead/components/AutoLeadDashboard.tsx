import React, { useEffect, useState } from 'react';
import { Bot, CalendarCheck, Folder, AlertTriangle, Check, Lock } from 'lucide-react';
import { CampaignSelectionArea } from './CampaignSelectionArea';
import { TeamAssignmentSection } from './TeamAssignmentSection';
import { ManagerAssignmentSection } from './ManagerAssignmentSection';
import {
  getLiveAds,
  getAutoAssignParams,
  toggleGlobalAutoAssign,
  toggleGlobalAttendanceRequirement,
  toggleManagerAutoAssign,
} from '../api/autoLeadApi';
import { AutoLeadCampaign } from '../types';

export const AutoLeadDashboard: React.FC = () => {
  // ─── State ───────────────────────────────────────────────────────────────────
  const [campaigns, setCampaigns] = useState<AutoLeadCampaign[]>([]);
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [savedAdIds, setSavedAdIds] = useState<string[]>([]);
  const [autoAssign, setAutoAssign] = useState(false);
  const [attendanceReq, setAttendanceReq] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [routingExpanded, setRoutingExpanded] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [adsRes, paramsRes] = await Promise.all([getLiveAds(), getAutoAssignParams()]);
      setCampaigns(adsRes);
      setAutoAssign(paramsRes.autoAssignLeads);
      setAttendanceReq(paramsRes.attendanceRequired);
      const ads = paramsRes.selectedAdIds || [];
      setSelectedAdIds(ads);
      setSavedAdIds(ads);
      setIsManagerMode(paramsRes.managerAutoAssignEnabled ?? false);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleToggleAutoAssign = async () => {
    const newVal = !autoAssign;
    setAutoAssign(newVal);
    try {
      await toggleGlobalAutoAssign(newVal, selectedAdIds);
    } catch {
      setAutoAssign(!newVal);
    }
  };

  const handleToggleAttendance = async () => {
    const newVal = !attendanceReq;
    setAttendanceReq(newVal);
    try {
      await toggleGlobalAttendanceRequirement(newVal);
    } catch {
      setAttendanceReq(!newVal);
    }
  };

  const handleSwitchRoutingStrategy = async (toManager: boolean) => {
    if (toManager === isManagerMode) return;
    setIsManagerMode(toManager);
    try {
      await toggleManagerAutoAssign(toManager);
    } catch {
      setIsManagerMode(!toManager);
      showToast('Failed to switch strategy', 'error');
    }
  };

  const handleToggleSelection = (adId: string) => {
    setSelectedAdIds(prev => prev.includes(adId) ? prev.filter(id => id !== adId) : [...prev, adId]);
  };

  const handleSelectAll = (adIdsToSelect: string[]) => {
    setSelectedAdIds(adIdsToSelect);
  };

  const handleClearAll = () => {
    setSelectedAdIds([]);
  };

  const handleApplyAds = async () => {
    setIsApplying(true);
    try {
      await toggleGlobalAutoAssign(autoAssign, selectedAdIds);
      setSavedAdIds(selectedAdIds);
      showToast(
        selectedAdIds.length === 0
          ? 'Successfully cleared all ads from auto-assign'
          : `Successfully assigned ${selectedAdIds.length} ads to auto-assign`,
        'success'
      );
    } catch {
      showToast('Failed to apply settings', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center font-sans h-full">
        <div className="w-12 h-12 border-4 border-[#1C3A76] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasUnsavedChanges =
    selectedAdIds.length !== savedAdIds.length ||
    selectedAdIds.some(id => !savedAdIds.includes(id)) ||
    savedAdIds.some(id => !selectedAdIds.includes(id));

  return (
    <div className="flex-1 w-full font-sans overflow-y-auto pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
          {toast.msg}
        </div>
      )}

      <div className="px-6 pt-2 w-full max-w-[1400px] mx-auto space-y-5">

        {/* ─── Smart Auto Assign Card ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Gradient Header */}
          <div className="flex items-center gap-3 px-5 py-5 bg-gradient-to-r from-[#1C3A76] to-[#2B5299]">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[16px]">Smart Auto Assign</p>
              <p className="text-white/75 text-[12px] mt-0.5">
                {autoAssign && campaigns.length > 0
                  ? `Active · ${campaigns.filter(c => selectedAdIds.includes(c.id)).length} ads`
                  : 'Intelligently distribute leads'}
              </p>
            </div>
            <button
              onClick={handleToggleAutoAssign}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${autoAssign ? 'bg-green-500' : 'bg-white/20'
                }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${autoAssign ? 'translate-x-5' : 'translate-x-0'
                }`} />
            </button>
          </div>

          {/* Collapsed: description */}
          {!autoAssign && (
            <div className="px-5 py-4">
              <p className="text-gray-400 text-[12.5px] leading-relaxed">
                Enable Smart Auto Assign to automatically distribute incoming leads to your team based on availability and skill level.
              </p>
            </div>
          )}

          {/* Settings: always visible when enabled */}
          {autoAssign && (
            <div className="divide-y divide-gray-50">
              {/* Require Attendance Row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-[#1C3A76]/10 flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="w-4 h-4 text-[#1C3A76]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-800">Require Attendance</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {attendanceReq
                      ? 'Only present staff will receive leads'
                      : 'All verified staff can receive leads equally'}
                  </p>
                </div>
                <button
                  onClick={handleToggleAttendance}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${attendanceReq ? 'bg-[#1C3A76]' : 'bg-gray-200'
                    }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${attendanceReq ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Step 1: Global Campaign Selection ─── */}
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden transition-all duration-300 ${
          !autoAssign ? 'opacity-55 saturate-50' : ''
        }`}>
          {/* Locked Overlay for Step 1 when Auto Assign is disabled */}
          {!autoAssign && (
            <div className="absolute inset-0 bg-gray-50/10 backdrop-blur-[0.5px] rounded-2xl z-10 flex flex-col items-center justify-center p-4">
              <div className="bg-[#1C3A76] text-white text-[12.5px] font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transform transition-transform hover:scale-105 pointer-events-auto">
                <Lock className="w-3.5 h-3.5" />
                <span>{'Enable "Smart Auto Assign" above to configure campaigns'}</span>
              </div>
            </div>
          )}

          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                autoAssign ? 'bg-[#1C3A76]/10 text-[#1C3A76]' : 'bg-gray-100 text-gray-400'
              }`}>
                <Folder className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[15px] font-bold text-gray-800">Step 1: Global Ad Campaigns</p>
                  {autoAssign && hasUnsavedChanges && (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200/50 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-gray-400 mt-0.5">Select which active ads participate in auto-assignment</p>
              </div>
            </div>
            
            {/* Show how many of the available campaigns are selected */}
            {autoAssign && (
              <span className="text-[12.5px] font-bold px-3 py-1 bg-gray-100 rounded-lg text-gray-600 border border-gray-200/40">
                {campaigns.filter(c => selectedAdIds.includes(c.id)).length} / {campaigns.length} Selected
              </span>
            )}
          </div>

          <div className="p-5">
            <CampaignSelectionArea
              campaigns={campaigns}
              selectedAdIds={selectedAdIds}
              onToggleSelection={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              compact
            />
          </div>

          {/* Apply Button Section */}
          {autoAssign && (
            <div className="px-5 pb-5 pt-1">
              <button
                onClick={handleApplyAds}
                disabled={isApplying}
                className={`w-full py-3 rounded-xl text-[13.5px] font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isApplying
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : hasUnsavedChanges
                    ? 'bg-[#1C3A76] hover:bg-[#2B5299] text-white shadow-lg shadow-[#1C3A76]/15 hover:shadow-xl hover:shadow-[#1C3A76]/25 cursor-pointer transform active:scale-[0.98]'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-50/50 hover:bg-emerald-100/60 cursor-pointer'
                }`}
              >
                {isApplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>Applying Selections...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <span>Apply Campaign Selections</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Settings Saved</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ─── Step 2: Routing Strategy & Targets ─── */}
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 relative ${
          !autoAssign ? 'opacity-55 saturate-50' : ''
        }`}>
          {/* Locked Overlay for Step 2 when Auto Assign is disabled */}
          {!autoAssign && (
            <div className="absolute inset-0 bg-gray-50/10 backdrop-blur-[0.5px] rounded-2xl z-10 flex flex-col items-center justify-center p-4">
              <div className="bg-purple-900 text-white text-[12.5px] font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transform transition-transform hover:scale-105 pointer-events-auto">
                <Lock className="w-3.5 h-3.5" />
                <span>{'Enable "Smart Auto Assign" above to configure routing strategy'}</span>
              </div>
            </div>
          )}

          {/* Collapsible header */}
          <button
            onClick={() => autoAssign && selectedAdIds.length > 0 && setRoutingExpanded(p => !p)}
            disabled={!autoAssign || selectedAdIds.length === 0}
            className={`w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 text-left ${
              !autoAssign || selectedAdIds.length === 0 ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50/45 cursor-pointer'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              !autoAssign || selectedAdIds.length === 0
                ? 'bg-gray-100 text-gray-400'
                : isManagerMode
                ? 'bg-purple-100 text-purple-600'
                : 'bg-[#1C3A76]/10 text-[#1C3A76]'
            }`}>
              <span className="text-lg">{isManagerMode ? '👤' : '👥'}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[15px] font-bold text-gray-800">Step 2: Routing Strategy & Targets</p>
                {autoAssign && selectedAdIds.length > 0 && (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isManagerMode 
                      ? 'bg-purple-50 text-purple-600 border-purple-100' 
                      : 'bg-green-50 text-green-700 border-green-100'
                  }`}>
                    {isManagerMode ? 'Manager-Based' : 'Team-Based'}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {!autoAssign || selectedAdIds.length === 0
                  ? 'Configure lead distribution strategy'
                  : isManagerMode
                  ? 'Manager-based lead distribution active'
                  : 'Team-based lead distribution active'}
              </p>
            </div>
            {autoAssign && selectedAdIds.length > 0 && (
              <span className="text-gray-400 text-xs shrink-0 font-bold px-1">
                {routingExpanded ? '▲' : '▼'}
              </span>
            )}
          </button>

          {autoAssign && selectedAdIds.length === 0 ? (
            <div className="p-6 flex flex-col items-center text-center space-y-3 bg-amber-50/30 border border-dashed border-amber-200/70 rounded-2xl m-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13.5px] font-bold text-amber-800">Pending Campaign Selections</p>
                <p className="text-[12px] text-amber-600/90 mt-1 max-w-[420px] leading-relaxed">
                  Please select and apply at least one ad campaign in <strong>Step 1</strong> to unlock routing configuration and team assignments.
                </p>
              </div>
            </div>
          ) : (
            routingExpanded && (
              <div className="p-5 space-y-4">
                {/* Strategy toggle */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200/80 bg-gray-50/70 p-1">
                  <button
                    onClick={() => handleSwitchRoutingStrategy(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200 cursor-pointer active:scale-[0.985] transform ${
                      !isManagerMode
                        ? 'bg-[#1C3A76] text-white shadow-md shadow-[#1C3A76]/15'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                    }`}
                  >
                    <span>👥</span> Team-Based Routing
                  </button>
                  <button
                    onClick={() => handleSwitchRoutingStrategy(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200 cursor-pointer active:scale-[0.985] transform ${
                      isManagerMode
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/15'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                    }`}
                  >
                    <span>👤</span> Manager-Based Routing
                  </button>
                </div>

                {/* Content */}
                <div className="transition-all duration-300">
                  {isManagerMode
                    ? <ManagerAssignmentSection campaigns={campaigns} />
                    : <TeamAssignmentSection campaigns={campaigns} attendanceRequired={attendanceReq} />
                  }
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
