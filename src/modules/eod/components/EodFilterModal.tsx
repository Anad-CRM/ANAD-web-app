import React, { useState, useEffect } from "react";
import { Search, X, Check, Calendar } from "lucide-react";
import { TeamsService } from "@/modules/teams/services/teams.service";
import { StaffService } from "@/modules/staffs/services/staff.service";
import { getUser } from "@/core/utils/auth";
import { Team } from "@/modules/teams/types/teams.types";
import { Staff } from "@/modules/staffs/types/staff.types";
import Button from "@/core/components/ui/Button";
import { Text } from "@/core/components/ui/Text";

export interface EodFilters {
  startDate?: string;
  endDate?: string;
  staffIds: string[];
  teamIds: string[];
  filterType: string;
}

interface EodFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: EodFilters) => void;
  initialFilters: EodFilters;
}

const FILTER_OPTIONS = [
  "Overall",
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Last Month",
  "Custom",
];

export const EodFilterModal = ({ isOpen, onClose, onApply, initialFilters }: EodFilterModalProps) => {
  const [tempFilters, setTempFilters] = useState<EodFilters>(initialFilters);
  const [teams, setTeams] = useState<Team[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [teamSearch, setTeamSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFilterData();
      setTempFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const fetchFilterData = async () => {
    setIsLoading(true);
    try {
      const user = getUser<{ organizationId: string; role: string }>();
      if (!user?.organizationId) return;

      const todayStr = new Date().toISOString().split('T')[0];

      const [teamsRes, staffsRes] = await Promise.all([
        TeamsService.getAllTeams({ organizationId: user.organizationId }),
        Promise.all([
          StaffService.getStaffList({ organizationId: user.organizationId, role: "Staff Member", date: todayStr }),
          StaffService.getStaffList({ organizationId: user.organizationId, role: "Team Leader", date: todayStr }),
          user.role === "Admin" ? StaffService.getStaffList({ organizationId: user.organizationId, role: "Manager", date: todayStr }) : Promise.resolve({ data: [] }),
        ])
      ]);

      if (teamsRes.status === "success") {
        setTeams(teamsRes.data || []);
      }

      const allStaff = staffsRes.flatMap(res => res.data || []);
      const uniqueStaff = Array.from(new Map(allStaff.map(s => [s.id, s])).values());
      setStaff(uniqueStaff as Staff[]);
    } catch (error) {
      console.error("Failed to fetch filter data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterTypeChange = (type: string) => {
    let start = "";
    let end = "";
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (type) {
      case "Today":
        start = end = formatDate(now);
        break;
      case "Yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        start = end = formatDate(yesterday);
        break;
      case "This Week":
        const weekStart = new Date(now);
        const day = now.getDay() || 7;
        weekStart.setDate(now.getDate() - day + 1);
        start = formatDate(weekStart);
        end = formatDate(now);
        break;
      case "This Month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        start = formatDate(monthStart);
        end = formatDate(now);
        break;
      case "Last Month":
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        start = formatDate(lastMonthStart);
        end = formatDate(lastMonthEnd);
        break;
      case "Overall":
        start = end = "";
        break;
      default:
        break;
    }

    setTempFilters({ ...tempFilters, filterType: type, startDate: start, endDate: end });
  };

  const toggleSelection = (id: string, key: "staffIds" | "teamIds") => {
    const current = tempFilters[key];
    const updated = current.includes(id) 
      ? current.filter(i => i !== id) 
      : [...current, id];
    setTempFilters({ ...tempFilters, [key]: updated });
  };

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  if (!isOpen) return null;

  const filteredTeamsList = teams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()));
  const filteredStaffList = staff.filter(s => s.userName?.toLowerCase().includes(staffSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div>
            <Text as="h2" size="xl" weight="bold" className="text-[#163172]">Filter Options</Text>
            <Text as="p" size="sm" className="text-gray-500 mt-0.5">Refine EOD reports and analytics</Text>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar">
          
          {/* Date Range */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-[#163172]" />
              Date Range
            </h3>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleFilterTypeChange(option)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    tempFilters.filterType === option
                      ? "bg-[#163172] text-white border-[#163172] shadow-lg shadow-[#163172]/20"
                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {tempFilters.filterType === "Custom" && (
              <div className="mt-6 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={tempFilters.startDate || ""} 
                    onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-[#163172] focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">End Date</label>
                  <input 
                    type="date" 
                    value={tempFilters.endDate || ""} 
                    onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-[#163172] focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Teams Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-[#163172] rounded-full" />
                Teams
              </h3>
              <button 
                onClick={() => setTempFilters({ ...tempFilters, teamIds: tempFilters.teamIds.length === teams.length ? [] : teams.map(t => t.id) })}
                className="text-[11px] font-bold text-[#163172] hover:bg-[#163172]/5 px-2 py-1 rounded-md transition-colors"
              >
                {tempFilters.teamIds.length === teams.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search teams by name..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm border border-transparent focus:border-[#163172] focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTeamsList.map((team) => {
                const isSelected = tempFilters.teamIds.includes(team.id);
                return (
                  <button
                    key={team.id}
                    onClick={() => toggleSelection(team.id, "teamIds")}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left border ${
                      isSelected ? "border-[#163172] bg-[#163172]/5 shadow-sm" : "border-gray-50 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isSelected ? "bg-[#163172] border-[#163172]" : "bg-white border-gray-300"
                    }`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-[13px] font-bold truncate ${isSelected ? 'text-[#163172]' : 'text-gray-700'}`}>{team.name}</span>
                  </button>
                );
              })}
              {filteredTeamsList.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-400 text-xs font-medium bg-gray-50 rounded-2xl">
                  No teams found matching &quot;{teamSearch}&quot;
                </div>
              )}
            </div>
          </section>

          {/* Staff Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-[#163172] rounded-full" />
                Staff Members
              </h3>
              <button 
                onClick={() => setTempFilters({ ...tempFilters, staffIds: tempFilters.staffIds.length === staff.length ? [] : staff.map(s => String(s.id)) })}
                className="text-[11px] font-bold text-[#163172] hover:bg-[#163172]/5 px-2 py-1 rounded-md transition-colors"
              >
                {tempFilters.staffIds.length === staff.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search staff members..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm border border-transparent focus:border-[#163172] focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredStaffList.map((s) => {
                const sId = String(s.id);
                const isSelected = tempFilters.staffIds.includes(sId);
                return (
                  <button
                    key={sId}
                    onClick={() => toggleSelection(sId, "staffIds")}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left border ${
                      isSelected ? "border-[#163172] bg-[#163172]/5 shadow-sm" : "border-gray-50 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isSelected ? "bg-[#163172] border-[#163172]" : "bg-white border-gray-300"
                    }`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-[13px] font-bold truncate ${isSelected ? 'text-[#163172]' : 'text-gray-700'}`}>{s.userName}</span>
                  </button>
                );
              })}
              {filteredStaffList.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-400 text-xs font-medium bg-gray-50 rounded-2xl">
                   No staff found matching &quot;{staffSearch}&quot;
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-8 border-t border-gray-100 bg-gray-50/80 flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <Button
            variant="white"
            onClick={() => setTempFilters({ 
              filterType: "Overall", 
              staffIds: [], 
              teamIds: [], 
              startDate: "", 
              endDate: "" 
            })}
            className="flex-1 h-14 rounded-2xl"
          >
            Clear All
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            className="flex-[2] h-14 rounded-2xl shadow-xl shadow-[#163172]/20"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #16317233;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #16317266;
        }
      `}</style>
    </div>
  );
};
