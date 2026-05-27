import React, { useState, useEffect } from "react";
import { Calendar, Users, ChevronDown } from "lucide-react";
import { Text } from "@/core/components/ui/Text";
import { getUser } from "@/core/utils/auth";
import { StaffService } from "@/modules/staffs/services/staff.service";
import { Staff } from "@/modules/staffs/types/staff.types";
import { COLORS } from "@/core/components/theme/colors";

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
  
  const user = getUser<{ id?: string; organizationId: string; role: string }>();
  const isAdminOrTL = user?.role === "Admin" || user?.role === "Manager" || user?.role === "Team Leader";

  useEffect(() => {
    if (isAdminOrTL && user?.organizationId) {
      const fetchStaff = async () => {
        const response = await StaffService.getAllStaff(user.organizationId, user.role);
        if (response.status === "success") {
          const filteredStaff = response.data.filter((s: Staff) => s.id !== user.id);
          setStaff(filteredStaff);
        }
      };
      fetchStaff();
    }
  }, [isAdminOrTL, user?.id, user?.organizationId, user?.role]);

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

  const handleStaffSelect = (s: Staff | null) => {
    onStaffChange(s ? String(s.id) : null);
    setSelectedStaffName(s?.userName || "All Staff");
    setShowStaffDropdown(false);
  };

  return (
    <div className="flex w-full flex-col gap-5 sm:gap-6 mb-8 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
        <div className="min-w-0">
          <Text as="h2" weight="bold" size="custom" style={{ fontSize: 'clamp(22px, 3vw, 28px)', color: COLORS.text }} className="leading-tight tracking-tight">
            Call Analytics
          </Text>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          {isAdminOrTL && (
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border px-4 sm:px-5 h-11 shadow-sm text-[14px] font-semibold transition-all sm:w-auto"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
              >
                <Users size={18} style={{ color: COLORS.primaryDark }} />
                <Text weight="semibold" size="custom" style={{ fontSize: '14px' }}>{selectedStaffName}</Text>
                <ChevronDown size={16} className={`ml-1 transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showStaffDropdown && (
                <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleStaffSelect(null)}
                    className={`w-full text-left px-4 py-3 transition-colors ${selectedStaffName === "All Staff" ? 'bg-slate-50' : ''}`}
                  >
                    <Text size="sm" weight={selectedStaffName === "All Staff" ? "bold" : "normal"} style={{ color: selectedStaffName === "All Staff" ? COLORS.primaryDark : COLORS.muted }}>
                      All Staff
                    </Text>
                  </button>
                  {staff.map((s) => (
                    <button
                      key={s.id}
                    onClick={() => handleStaffSelect(s)}
                    className={`w-full text-left px-4 py-3 transition-colors ${selectedStaffName === s.userName ? 'bg-slate-50' : ''}`}
                  >
                      <Text size="sm" weight={selectedStaffName === s.userName ? "bold" : "normal"} style={{ color: selectedStaffName === s.userName ? COLORS.primaryDark : COLORS.muted }}>
                        {s.userName}
                      </Text>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex w-full items-center justify-center gap-2 px-5 h-11 rounded-xl shadow-lg hover:opacity-95 transition-all active:scale-95 text-[14px] font-bold sm:w-auto"
              style={{ backgroundColor: COLORS.primaryDark, color: COLORS.bg }}
            >
              <Calendar size={18} />
              <Text weight="bold" size="custom" style={{ fontSize: '14px' }}>{selectedDateLabel}</Text>
            </button>
            
            {showDateDropdown && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleDateSelect(opt)}
                    className={`w-full text-left px-4 py-3 transition-colors ${selectedDateLabel === opt.label ? 'bg-slate-50' : ''}`}
                  >
                    <Text size="sm" weight={selectedDateLabel === opt.label ? "bold" : "normal"} style={{ color: selectedDateLabel === opt.label ? COLORS.primaryDark : COLORS.muted }}>
                      {opt.label}
                    </Text>
                  </button>
                ))}
              </div>
            )}
          </div>
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
