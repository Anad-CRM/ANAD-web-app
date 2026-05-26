import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { AutoLeadCampaign } from '../types';
import {
  TeamItem,
  getTeamsList,
  getTeamAutoAssignStatus,
  updateTeamAds,
  getTeamStrengthAutoAssignStatus,
  toggleTeamStrengthAutoAssignLeads,
  TeamStrengthItem,
} from '../api/autoLeadApi';
import { DistributionAssignModal } from './DistributionAssignModal';
import { getUser } from '@/core/utils/auth';
import { Text } from '@/core/components/ui/Text';
import { COLORS } from '@/core/components/theme/colors';

interface Props {
  campaigns: AutoLeadCampaign[];
  attendanceRequired?: boolean;
}

export const TeamAssignmentSection: React.FC<Props> = ({ campaigns, attendanceRequired = false }) => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [teamAdsMap, setTeamAdsMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [modalTeam, setModalTeam] = useState<TeamItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [orgStrengthEnabled, setOrgStrengthEnabled] = useState(false);
  const [teamStrengthMap, setTeamStrengthMap] = useState<Record<string, {
    id: string;
    strengthAutoAssignLeads: boolean | null;
    effectiveStrengthAutoAssignLeads: boolean;
  }>>({});
  const [isUpdatingOrgStrength, setIsUpdatingOrgStrength] = useState(false);
  const [isUpdatingTeamStrength, setIsUpdatingTeamStrength] = useState<Record<string, boolean>>({});

  const loadTeams = async () => {
    setLoading(true);
    const user = getUser<{ organizationId?: number }>();
    const orgId = user?.organizationId;

    const [list, strengthStatus] = await Promise.all([
      getTeamsList(),
      orgId ? getTeamStrengthAutoAssignStatus(orgId) : Promise.resolve(null),
    ]);

    setTeams(list);

    if (strengthStatus && strengthStatus.status === 'success') {
      setOrgStrengthEnabled(strengthStatus.data.teamStrengthAutoAssignLeads);
      const strengthMap: Record<string, typeof strengthStatus.data.teams[0]> = {};
      strengthStatus.data.teams.forEach((t: TeamStrengthItem) => {
        strengthMap[t.id] = t;
      });
      setTeamStrengthMap(strengthMap);
    }

    const results = await Promise.all(
      list.map(async t => {
        const status = await getTeamAutoAssignStatus(t.id);
        return { id: t.id, ids: status.selectedAdIds };
      })
    );

    const map: Record<string, string[]> = {};
    results.forEach(r => {
      map[r.id] = r.ids;
    });

    setTeamAdsMap(map);
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => loadTeams());
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApply = async (teamId: string, adIds: string[]) => {
    try {
      await updateTeamAds(teamId, adIds);
      setTeamAdsMap(prev => ({ ...prev, [teamId]: adIds }));
      showToast(adIds.length === 0 ? 'Cleared all ads from team' : `Assigned ${adIds.length} ads to team`, 'success');
    } catch {
      showToast('Failed to update team ads', 'error');
      throw new Error('Failed');
    }
  };

  const handleToggleOrgStrength = async () => {
    const newVal = !orgStrengthEnabled;
    setIsUpdatingOrgStrength(true);
    try {
      const res = await toggleTeamStrengthAutoAssignLeads(newVal);
      if (res.data?.status === 'success') {
        setOrgStrengthEnabled(newVal);
        showToast(res.data?.message || 'Updated organization strength settings', 'success');
        await loadTeams();
      } else {
        showToast(res.data?.message || 'Failed to update organization strength settings', 'error');
      }
    } catch {
      showToast('An error occurred while updating settings', 'error');
    } finally {
      setIsUpdatingOrgStrength(false);
    }
  };

  const handleToggleTeamStrength = async (teamId: string) => {
    const teamStrength = teamStrengthMap[teamId];
    const currentEffective = teamStrength ? teamStrength.effectiveStrengthAutoAssignLeads : orgStrengthEnabled;
    const newVal = !currentEffective;

    setIsUpdatingTeamStrength(prev => ({ ...prev, [teamId]: true }));
    try {
      const res = await toggleTeamStrengthAutoAssignLeads(newVal, [teamId]);
      if (res.data?.status === 'success') {
        showToast(res.data?.message || 'Updated team strength override', 'success');
        await loadTeams();
      } else {
        showToast(res.data?.message || 'Failed to update team strength override', 'error');
      }
    } catch {
      showToast('An error occurred while updating team setting', 'error');
    } finally {
      setIsUpdatingTeamStrength(prev => ({ ...prev, [teamId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-9 h-9 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.primary }} />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 m-4 sm:m-5">
        <Users className="w-12 h-12 text-gray-300 mb-3" />
        <Text weight="bold" className="text-gray-800 block" style={{ fontSize: '14px' }}>
          No Teams Found
        </Text>
        <Text className="text-gray-400 block mt-1 max-w-[280px]" style={{ fontSize: '12px', lineHeight: '1.55' }}>
          You need to create at least one team in the CRM settings before you can assign lead routing targets.
        </Text>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">
        <div className="bg-gradient-to-r from-[#1C3A76] via-[#244A91] to-[#2E5AA8] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-[#2B5299]/50 overflow-hidden relative">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <Users className="w-40 h-40 text-white" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <Text as="h3" weight="bold" className="text-white block" style={{ fontSize: '15.5px', letterSpacing: '0.02em' }}>
                  Team Strength-Based Distribution
                </Text>
              </div>
              <Text className="text-white/85 block max-w-[600px]" style={{ fontSize: '12.5px', lineHeight: '1.65' }}>
                Distribute incoming leads dynamically among your teams. Larger teams with more active present members today will receive a larger share of the lead pool.
              </Text>
              {attendanceRequired && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/20 text-amber-300 text-[11px] font-semibold mt-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Attendance Check Active: Only present members count toward strength</span>
                </div>
              )}
            </div>

            <button
              onClick={handleToggleOrgStrength}
              disabled={isUpdatingOrgStrength}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 shrink-0 ${
                orgStrengthEnabled ? 'bg-green-500 shadow-md shadow-green-500/20' : 'bg-white/20'
              } ${isUpdatingOrgStrength ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  orgStrengthEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {teams.map(team => {
            const assignedIds = teamAdsMap[team.id] || [];
            const assignedCount = assignedIds.length;
            const assignedNames = assignedIds
              .slice(0, 3)
              .map(id => campaigns.find(c => c.id === id)?.title)
              .filter(Boolean) as string[];

            const totalMembers = team.users?.length ?? team.members?.length ?? team.membersCount ?? team.memberCount ?? 0;
            const activeMembers = team.users
              ? team.users.filter((u: { Attendance?: unknown; Attendances?: unknown }) => u.Attendance || (Array.isArray(u.Attendances) && u.Attendances.length > 0)).length
              : totalMembers;

            const strengthInfo = teamStrengthMap[team.id];
            const strengthOverrideVal = strengthInfo ? strengthInfo.strengthAutoAssignLeads : null;
            const effectiveStrength = strengthInfo ? strengthInfo.effectiveStrengthAutoAssignLeads : orgStrengthEnabled;

            return (
              <div key={team.id} className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col justify-between relative group h-full">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-200/50 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-[17px] shadow-xs">
                        {(team.name || 'T')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Text weight="bold" className="text-gray-800 block truncate group-hover:text-[#1C3A76] transition-colors" style={{ fontSize: '15px' }}>
                          {team.name}
                        </Text>
                        <Text className="text-gray-400 block mt-0.5 font-medium" style={{ fontSize: '12px' }}>
                          {totalMembers} members total
                        </Text>
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg text-[12px] font-bold tracking-wide shrink-0 self-start sm:self-auto ${
                        assignedCount > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs'
                          : 'bg-gray-50 text-gray-400 border border-gray-100'
                      }`}
                    >
                      {assignedCount > 0 ? `${assignedCount} Ads` : 'No Ads'}
                    </div>
                  </div>

                  {assignedCount > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {assignedNames.map(name => (
                        <span
                          key={name}
                          className="text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200/60 px-2 py-0.5 rounded-md truncate max-w-[125px] hover:bg-gray-100 transition-colors"
                          title={name}
                        >
                          {name}
                        </span>
                      ))}
                      {assignedCount > 3 && (
                        <span className="text-[10px] text-gray-400 font-bold bg-gray-50/50 border border-dashed border-gray-200/60 px-1.5 py-0.5 rounded-md">
                          +{assignedCount - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[12.5px] font-semibold text-gray-600 mt-4 bg-gray-50/60 border border-gray-100 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">📈</span>
                      <span className="text-gray-500 font-medium">Distribution Weight</span>
                    </div>
                    <span className="text-[#1C3A76] font-bold bg-[#1C3A76]/5 px-2.5 py-0.5 rounded-lg border border-[#1C3A76]/10">
                      {attendanceRequired ? `${activeMembers} Active` : `${totalMembers} Members`}
                    </span>
                  </div>

                  <div
                    className={`mt-3.5 p-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                      effectiveStrength ? 'bg-indigo-50/40 border-indigo-100' : 'bg-gray-50/30 border-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Text weight="bold" className="text-gray-700 block" style={{ fontSize: '12.5px' }}>
                          Strength Routing
                        </Text>
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                            strengthOverrideVal === null
                              ? 'bg-gray-100/80 text-gray-400 border-gray-200/60'
                              : 'bg-indigo-100/60 text-indigo-700 border-indigo-200/40'
                          }`}
                        >
                          {strengthOverrideVal === null ? 'Inherited' : 'Override'}
                        </span>
                      </div>
                      <Text className="text-gray-400 block mt-0.5 truncate font-medium" style={{ fontSize: '11px' }}>
                        {effectiveStrength ? 'Weighted distribution active' : 'Standard round-robin routing'}
                      </Text>
                    </div>

                    <button
                      onClick={() => handleToggleTeamStrength(team.id)}
                      disabled={isUpdatingTeamStrength[team.id]}
                      className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 flex items-center ${
                        effectiveStrength ? 'bg-indigo-600' : 'bg-gray-200'
                      } ${isUpdatingTeamStrength[team.id] ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          effectiveStrength ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setModalTeam(team);
                    setModalLoading(false);
                  }}
                  className="mt-4 w-full py-2.5 bg-white border border-gray-200 text-[#1C3A76] hover:bg-[#1C3A76] hover:text-white text-[12.5px] sm:text-[13px] font-bold rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-[#1C3A76]/10 cursor-pointer transform hover:scale-[1.01]"
                >
                  {assignedCount > 0 ? 'Manage Assigned Ads' : 'Assign Campaigns'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {modalTeam && (
        <DistributionAssignModal
          title={modalTeam.name}
          subtitle="Select ads to assign to this team"
          campaigns={campaigns}
          initialSelectedIds={teamAdsMap[modalTeam.id] || []}
          isLoading={modalLoading}
          onClose={() => setModalTeam(null)}
          onApply={ids => handleApply(modalTeam.id, ids)}
        />
      )}
    </>
  );
};
