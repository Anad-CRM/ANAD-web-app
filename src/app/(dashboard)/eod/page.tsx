"use client";

import React, { useEffect, useState } from "react";
import { EodModeBanner } from "@/modules/eod/components/EodModeBanner";
import { StaffList } from "@/modules/eod/components/StaffList";
import { EodAnalyticsPanel } from "@/modules/eod/components/EodAnalyticsPanel";
import { EodStaffMember } from "@/modules/eod/types";
import { getEodStaffSummary } from "@/modules/eod/api/eodApi";

export default function EodPage() {
  const [staff, setStaff] = useState<EodStaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<EodStaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      const data = await getEodStaffSummary();
      setStaff(data);
      if (data.length > 0) {
        setSelectedStaff(data[0]);
      }
      setIsLoading(false);
    };
    fetchStaff();
  }, []);

  return (
    <div className="flex flex-col gap-[22px]">
      
      <div className="flex justify-end gap-4 p-6 pb-2">
        <button className="w-11 h-11 bg-[#233A78] text-white rounded-xl flex items-center justify-center shadow-md hover:bg-[#3561A5] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        </button>
        <button className="w-11 h-11 bg-[#233A78] text-white rounded-xl flex items-center justify-center shadow-md hover:bg-[#3561A5] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      <EodModeBanner />

      <div className="flex-1 p-6 pt-0 overflow-hidden mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 h-full">
          
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center p-20 text-gray-400 animate-pulse text-lg font-medium">
               Initializing EOD Analytics...
            </div>
          ) : (
            <>
              <StaffList 
                staff={staff} 
                selectedId={selectedStaff?.userId} 
                onSelect={setSelectedStaff} 
              />
              <EodAnalyticsPanel data={selectedStaff} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
