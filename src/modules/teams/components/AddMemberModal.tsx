import React, { useState, useEffect, useMemo } from 'react';
import { TeamsService } from '../services/teams.service';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { Text } from '@/core/components/ui/Text';
import { COLORS } from '@/core/components/theme/colors';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-[24px] sm:rounded-[24px] w-[min(100vw-1rem,32rem)] sm:w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b" style={{ borderColor: COLORS.primaryXlight }}>
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark }}>
              <UserPlus size={24} />
            </div>
            <div>
              <Text weight="bold" size="lg" style={{ color: COLORS.text }}>Add Team Members   </Text>
              <Text size="sm" style={{ color: COLORS.muted }}>Select staff to add to this team</Text>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: COLORS.subtle }}>
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-5 sm:p-6 pb-2 border-b" style={{ borderColor: COLORS.primaryXlight }}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: COLORS.subtle }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{
                ['--tw-ring-color' as never]: COLORS.primaryDark,
              } as React.CSSProperties}
            />
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <Text size="xs" weight="medium" className="px-2.5 py-1 rounded-lg" style={{ color: COLORS.primaryDark, backgroundColor: COLORS.primaryXlight }}>
                {selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected
              </Text>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-medium transition-colors"
                style={{ color: COLORS.muted }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.primaryDark }}></div>
              <Text size="sm" style={{ color: COLORS.muted }}>Loading staff...</Text>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus size={28} style={{ color: COLORS.subtle }} />
              </div>
              <Text weight="bold" size="base" className="mb-1" style={{ color: COLORS.text }}>
                {searchQuery ? "No results found" : "No available staff"}
              </Text>
              <Text size="sm" className="max-w-[250px]" style={{ color: COLORS.muted }}>
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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-colors" style={{ backgroundColor: isSelected ? COLORS.primaryDark : COLORS.primaryXlight, color: isSelected ? COLORS.surface : COLORS.primaryDark }}>
                      {(staff.userName as string)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text weight="bold" size="sm" className="truncate block" style={{ color: COLORS.text }}>
                        {(staff.userName as string) || 'No Name'}
                      </Text>
                      <Text size="xs" className="truncate block mt-0.5" style={{ color: COLORS.muted }}>
                        {staff.email as string}
                      </Text>
                      {Boolean(staff.role) && (
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.muted }}>
                          {staff.role as string}
                        </div>
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors" style={{ backgroundColor: isSelected ? COLORS.primaryDark : 'transparent', borderColor: isSelected ? COLORS.primaryDark : COLORS.border, color: isSelected ? COLORS.surface : 'transparent' }}>
                      <Check size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t bg-white" style={{ borderColor: COLORS.primaryXlight }}>
          <button
            disabled={selectedIds.length === 0 || isSubmitting}
            onClick={handleAddMembers}
            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${selectedIds.length > 0 && !isSubmitting
              ? 'text-white shadow-lg active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            style={selectedIds.length > 0 && !isSubmitting ? { backgroundColor: COLORS.primaryDark } : undefined}
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
