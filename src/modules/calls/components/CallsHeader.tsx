import React, { useState, useEffect } from "react";
import { Calendar, Download, Users, ChevronDown } from "lucide-react";
import { getUser } from "@/core/utils/auth";
import { StaffService } from "@/modules/staffs/services/staff.service";
import { Staff } from "@/modules/staffs/types/staff.types";

interface CallsHeaderProps {
  onDateRangeChange: (range: { startDate: string | null; endDate: string | null; label: string }) => void;
  onStaffChange: (staffId: string | null) => void;
  selectedDateLabel: string;
}

export const CallsHeader: React.FC<CallsHeaderProps> = ({ 
  onDateRangeChange, 
  onStaffChange,
  selectedDateLabel 
}) => {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaffName, setSelectedStaffName] = useState("All Staff");
  
  const user = getUser<{ organizationId: string; role: string }>();
  const isAdminOrTL = user?.role === "Admin" || user?.role === "Manager" || user?.role === "Team Leader";

  useEffect(() => {
    if (isAdminOrTL) {
      const fetchStaff = async () => {
        const response = await StaffService.getStaffList({
          organizationId: user.organizationId,
          role: "Staff Member",
          date: new Date().toISOString()
        });
        if (response.status === "success") {
          setStaff(response.data);
        }
      };
      fetchStaff();
    }
  }, [isAdminOrTL, user?.organizationId]);

  const dateOptions = [
    { label: "Today", getValue: () => ({ startDate: new Date().toISOString(), endDate: new Date().toISOString() }) },
    { label: "Yesterday", getValue: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return { startDate: d.toISOString(), endDate: d.toISOString() };
    } },
    { label: "This Week", getValue: () => {
      const d = new Date();
      const day = d.getDay() || 7;
      if (day !== 1) d.setHours(-24 * (day - 1));
      return { startDate: d.toISOString(), endDate: new Date().toISOString() };
    } },
    { label: "This Month", getValue: () => {
      const d = new Date();
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      return { startDate: start.toISOString(), endDate: d.toISOString() };
    } },
    { label: "Last Month", getValue: () => {
      const d = new Date();
      const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const end = new Date(d.getFullYear(), d.getMonth(), 0);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    } },
    { label: "Overall", getValue: () => ({ startDate: null, endDate: null }) },
  ];

  const handleDateSelect = (option: typeof dateOptions[0]) => {
    const range = option.getValue();
    onDateRangeChange({ ...range, label: option.label });
    setShowDateDropdown(false);
  };

  const handleStaffSelect = (s: any | null) => {
    onStaffChange(s ? s.id : null);
    setSelectedStaffName(s ? s.userName : "All Staff");
    setShowStaffDropdown(false);
  };

  return (
    <div className="flex flex-col gap-6 mb-8 w-full font-sans">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between w-full">
        {/* Breadcrumb Pill */}
        <div className="bg-[#233A78] text-white px-8 py-2.5 rounded-tr-[24px] rounded-bl-[2px] rounded-tl-[24px] rounded-br-[2px] text-[15px] font-semibold shadow-md inline-block">
          Call Analytics
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Calendar Picker Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center justify-center w-11 h-11 bg-[#233A78] text-white rounded-xl shadow-lg hover:opacity-95 transition-all active:scale-95"
            >
              <Calendar size={20} />
            </button>
            
            {showDateDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleDateSelect(opt)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${selectedDateLabel === opt.label ? 'text-[#233A78] font-bold bg-slate-50' : 'text-slate-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 px-6 h-11 bg-[#233A78] text-white rounded-xl shadow-lg text-[14px] font-bold transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]">
            <Download size={18} className="rotate-180" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Secondary Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Active Date Label Display */}
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium shadow-sm flex items-center gap-2">
            <Calendar size={14} className="text-[#233A78]" />
            {selectedDateLabel}
          </div>

          {/* Staff Filter (Role Based) */}
          {isAdminOrTL && (
            <div className="relative">
              <button 
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                className="flex items-center gap-2 px-5 h-11 bg-white border border-slate-200 rounded-xl shadow-sm text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Users size={18} className="text-[#233A78]" />
                <span>{selectedStaffName}</span>
                <ChevronDown size={16} className={`ml-1 transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showStaffDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleStaffSelect(null)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${selectedStaffName === "All Staff" ? 'text-[#233A78] font-bold bg-slate-50' : 'text-slate-600'}`}
                  >
                    All Staff
                  </button>
                  {staff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStaffSelect(s)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${selectedStaffName === s.userName ? 'text-[#233A78] font-bold bg-slate-50' : 'text-slate-600'}`}
                    >
                      {s.userName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
