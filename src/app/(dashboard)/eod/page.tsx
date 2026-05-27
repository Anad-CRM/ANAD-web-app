"use client";

import React, { useEffect, useState } from "react";
import { EodModeBanner } from "@/modules/eod/components/EodModeBanner";
import { StaffList } from "@/modules/eod/components/StaffList";
import { EodAnalyticsPanel } from "@/modules/eod/components/EodAnalyticsPanel";
import { EodStaffMember } from "@/modules/eod/types";
import { getEodStaffSummary } from "@/modules/eod/api/eodApi";

import { EodSettingsModal } from "@/modules/eod/components/EodSettingsModal";
import { EodFilterModal, EodFilters } from "@/modules/eod/components/EodFilterModal";
import { getUser, setUser } from "@/core/utils/auth";

export default function EodPage() {
  const [staff, setStaff] = useState<EodStaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<EodStaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState<EodFilters>({
    filterType: "Today",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    staffIds: [],
    teamIds: [],
  });
  
  // Get initial mode from user data
  const user = getUser<any>();
  const initialMode = user?.organization?.eodMode || 'auto';
  const [eodMode, setEodMode] = useState<'auto' | 'manual'>(initialMode);
  
  const isAdminOrManager = ['Admin', 'Manager'].includes(user?.role || '');

  const fetchStaff = async (activeFilters: EodFilters) => {
    setIsLoading(true);
    const data = await getEodStaffSummary(activeFilters);
    setStaff(data);
    if (data.length > 0) {
      setSelectedStaff(data[0]);
    } else {
      setSelectedStaff(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff(filters);
  }, []);

  const handleApplyFilters = (newFilters: EodFilters) => {
    setFilters(newFilters);
    fetchStaff(newFilters);
  };

  const handleModeChange = (newMode: 'auto' | 'manual') => {
    setEodMode(newMode);
    // Update local user data so it persists across refreshes
    const currentUser = getUser<any>();
    if (currentUser && currentUser.organization) {
      currentUser.organization.eodMode = newMode;
      setUser(currentUser);
    }
  };

  return (
    <div className="flex flex-col -m-4 p-4 sm:-m-8 sm:p-8 pb-12">
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 flex justify-center">
          <EodModeBanner mode={eodMode} />
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all ${
              filters.filterType !== 'Overall' || filters.staffIds.length > 0 || filters.teamIds.length > 0
                ? 'bg-blue-500 text-white animate-pulse'
                : 'bg-[#163172] text-white hover:bg-[#0D1B3E]'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>
          
          {isAdminOrManager && (
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 bg-[#163172] text-white rounded-xl flex items-center justify-center shadow-md hover:bg-[#0D1B3E] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 sm:gap-6 items-start">
          
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
               <div className="w-12 h-12 border-4 border-[#163172]/20 border-t-[#163172] rounded-full animate-spin" />
               <span className="text-lg font-medium">Fetching EOD Data...</span>
            </div>
          ) : (
            <>
              <div className="relative lg:sticky lg:top-0 h-[350px] lg:h-[calc(100vh-140px)] z-10 w-full mb-2 lg:mb-0">
                <StaffList 
                  staff={staff} 
                  selectedId={selectedStaff?.userId} 
                  onSelect={setSelectedStaff} 
                />
              </div>
              <div className="w-full">
                <EodAnalyticsPanel data={selectedStaff} />
              </div>
            </>
          )}
        </div>
      </div>

      <EodSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentMode={eodMode}
        onModeChange={handleModeChange}
      />

      <EodFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
