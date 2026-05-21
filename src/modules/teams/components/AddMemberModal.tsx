import React, { useState, useEffect, useMemo } from 'react';
import { TeamsService } from '../services/teams.service';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { Text } from '@/core/components/ui/Text';
import { X, Search, UserPlus, Check } from 'lucide-react';

interface AddMemberModalProps {
  teamId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMemberModal({ teamId, onClose, onSuccess }: AddMemberModalProps) {
  const { user } = useAuthContext();
  const [allStaff, setAllStaff] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!user || (!user.organizationId && !user.organization?.id)) return;
      const orgId = user.organizationId || user.organization?.id || "";

      try {
        const response = (await TeamsService.getStaffExcludeTeam({
          teamId,
          organizationId: orgId
        })) as { status: string; data?: Record<string, unknown>[] };
        if (response.status === 'success') {
          setAllStaff(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, [teamId, user]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return allStaff;
    const lowerQuery = searchQuery.toLowerCase();
    return allStaff.filter(staff =>
      (staff.userName as string)?.toLowerCase().includes(lowerQuery) ||
      (staff.email as string)?.toLowerCase().includes(lowerQuery)
    );
  }, [allStaff, searchQuery]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddMembers = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const response = (await TeamsService.changeStaffTeam({
        userId: selectedIds,
        newTeamId: teamId
      })) as { status: string; message?: string };
      if (response.status === 'success') {
        onSuccess();
      } else {
        alert(response.message || "Failed to add members");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
              <UserPlus size={24} />
            </div>
            <div>
              <Text weight="bold" size="lg" className="text-slate-900">Add Team Members   </Text>
              <Text size="sm" className="text-slate-500">Select staff to add to this team</Text>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-6 pb-2 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#233A78] focus:border-transparent transition-all"
            />
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <Text size="xs" weight="medium" className="text-[#233A78] bg-blue-50 px-2.5 py-1 rounded-lg">
                {selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected
              </Text>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#233A78]"></div>
              <Text size="sm" className="text-slate-500">Loading staff...</Text>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus size={28} className="text-slate-300" />
              </div>
              <Text weight="bold" size="base" className="text-slate-800 mb-1">
                {searchQuery ? "No results found" : "No available staff"}
              </Text>
              <Text size="sm" className="text-slate-500 max-w-[250px]">
                {searchQuery
                  ? "Try searching with different keywords"
                  : "All staff members are already in this team or none exist."}
              </Text>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredStaff.map((staff) => {
                const isSelected = selectedIds.includes(staff.id as string);
                return (
                  <div
                    key={staff.id as string}
                    onClick={() => handleToggleSelect(staff.id as string)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                      ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-colors ${isSelected ? 'bg-[#233A78] text-white' : 'bg-slate-100 text-[#233A78]'
                      }`}>
                      {(staff.userName as string)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text weight="bold" size="sm" className="text-slate-900 truncate block">
                        {(staff.userName as string) || 'No Name'}
                      </Text>
                      <Text size="xs" className="text-slate-500 truncate block mt-0.5">
                        {staff.email as string}
                      </Text>
                      {Boolean(staff.role) && (
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium uppercase tracking-wider">
                          {staff.role as string}
                        </div>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected
                      ? 'bg-[#233A78] border-[#233A78] text-white'
                      : 'border-slate-300 text-transparent'
                      }`}>
                      <Check size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <button
            disabled={selectedIds.length === 0 || isSubmitting}
            onClick={handleAddMembers}
            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${selectedIds.length > 0 && !isSubmitting
              ? 'bg-[#233A78] hover:bg-[#1E3163] text-white shadow-lg shadow-blue-900/20 active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlus size={18} />
                <span>
                  {selectedIds.length === 0
                    ? "Select Members to Add"
                    : `Add ${selectedIds.length} Member${selectedIds.length > 1 ? 's' : ''}`}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
