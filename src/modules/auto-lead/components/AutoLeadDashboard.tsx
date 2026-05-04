import React, { useEffect, useState } from 'react';
import { Bot, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
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
      setSelectedAdIds(paramsRes.selectedAdIds || []);
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

  const showRoutingPanel = selectedAdIds.length > 0 && autoAssign;

  return (
    <div className="flex-1 w-full font-sans overflow-y-auto pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
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
              className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                autoAssign ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                autoAssign ? 'translate-x-5' : 'translate-x-0'
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
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                    attendanceReq ? 'bg-[#1C3A76]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    attendanceReq ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Global Campaign Selection ─── */}
        {autoAssign && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* Section header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <p className="text-[15px] font-bold text-gray-800">Global Ad Campaigns</p>
                <p className="text-[12px] text-gray-400 mt-0.5">Select which ads to include in auto-assignment</p>
              </div>
              {/* Show how many of the available campaigns are selected */}
              <span className="text-[13px] font-semibold text-[#1C3A76]">
                {campaigns.filter(c => selectedAdIds.includes(c.id)).length}/{campaigns.length}
              </span>
            </div>

            <CampaignSelectionArea
              campaigns={campaigns}
              selectedAdIds={selectedAdIds}
              onToggleSelection={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              compact
            />

            {/* Apply Button */}
            <div className="px-5 pb-5 pt-2">
              <button
                onClick={handleApplyAds}
                disabled={isApplying}
                className="w-full py-3.5 bg-[#1C3A76] text-white text-[14px] font-semibold rounded-2xl shadow-lg shadow-[#1C3A76]/20 hover:shadow-xl transition-all disabled:opacity-60"
              >
                {isApplying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Applying...
                  </span>
                ) : 'Apply Ads'}
              </button>
            </div>
          </div>
        )}

        {/* ─── Routing Strategy (only when global ads active) ─── */}
        {showRoutingPanel && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Collapsible header */}
            <button
              onClick={() => setRoutingExpanded(p => !p)}
              className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-50 text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isManagerMode ? 'bg-purple-100' : 'bg-[#1C3A76]/10'
              }`}>
                <span className="text-lg">{isManagerMode ? '👤' : '👥'}</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-gray-800">Routing Strategy</p>
                <p className="text-[12px] text-gray-400">
                  {isManagerMode ? 'Manager-based distribution' : 'Team-based distribution'}
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                isManagerMode ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-700'
              }`}>Active</span>
            </button>

            {routingExpanded && (
              <div className="p-4 space-y-4">
                {/* Strategy toggle */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <button
                    onClick={() => handleSwitchRoutingStrategy(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold transition-all ${
                      !isManagerMode ? 'bg-[#1C3A76] text-white border-b-2 border-transparent' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>👥</span> Team-Based
                  </button>
                  <div className="w-px bg-gray-200" />
                  <button
                    onClick={() => handleSwitchRoutingStrategy(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold transition-all ${
                      isManagerMode ? 'bg-purple-600 text-white border-b-2 border-transparent' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>👤</span> Manager-Based
                  </button>
                </div>

                {/* Content */}
                {isManagerMode
                  ? <ManagerAssignmentSection campaigns={campaigns} />
                  : <TeamAssignmentSection campaigns={campaigns} />
                }
              </div>
            )}
          </div>
        )}

        {/* ─── Learn More / Disabled state ─── */}
        {!autoAssign && (
          <div className="text-center pb-4">
            <p className="text-[13px] text-gray-400">
              Enable Smart Auto Assign above to configure lead routing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
