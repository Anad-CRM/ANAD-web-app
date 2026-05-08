import React, { useState, useEffect } from "react";
import { Calendar, Download, Users, ChevronDown } from "lucide-react";
import { Text } from "@/core/components/ui/Text";
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
    if (isAdminOrTL && user?.organizationId) {
      const fetchStaff = async () => {
        const response = await StaffService.getAllStaff(user.organizationId, user.role);
        if (response.status === "success") {
          const filteredStaff = response.data.filter((s: Staff) => s.id !== (user as any).id);
          setStaff(filteredStaff);
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
      <div className="flex items-center justify-between w-full">
        <div>
          <Text as="h2" weight="bold" size="custom" style={{ fontSize: '28px' }} className="text-black leading-tight tracking-tight whitespace-nowrap">
            Call Analytics
          </Text>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAdminOrTL && (
            <div className="relative">
              <button 
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                className="flex items-center gap-2 px-5 h-11 bg-white border border-slate-200 rounded-xl shadow-sm text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Users size={18} className="text-[#233A78]" />
                <Text weight="semibold" size="custom" style={{ fontSize: '14px' }}>{selectedStaffName}</Text>
                <ChevronDown size={16} className={`ml-1 transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showStaffDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
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

          <div className="relative">
            <button 
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-5 h-11 bg-[#233A78] text-white rounded-xl shadow-lg hover:opacity-95 transition-all active:scale-95 text-[14px] font-bold"
            >
              <Calendar size={18} />
              <Text weight="bold" size="custom" style={{ fontSize: '14px' }}>{selectedDateLabel}</Text>
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
