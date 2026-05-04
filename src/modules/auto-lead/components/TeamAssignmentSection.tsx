import React, { useState, useEffect } from 'react';
import { Users, Briefcase } from 'lucide-react';
import { AutoLeadCampaign } from '../types';
import { TeamItem, getTeamsList, getTeamAutoAssignStatus, updateTeamAds } from '../api/autoLeadApi';
import { DistributionAssignModal } from './DistributionAssignModal';

interface Props {
  campaigns: AutoLeadCampaign[];
}

export const TeamAssignmentSection: React.FC<Props> = ({ campaigns }) => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [teamAdsMap, setTeamAdsMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [modalTeam, setModalTeam] = useState<TeamItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    const list = await getTeamsList();
    setTeams(list);
    const results = await Promise.all(
      list.map(async (t) => {
        const status = await getTeamAutoAssignStatus(t.id);
        return { id: t.id, ids: status.selectedAdIds };
      })
    );
    const map: Record<string, string[]> = {};
    results.forEach(r => { map[r.id] = r.ids; });
    setTeamAdsMap(map);
    setLoading(false);
  };

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#1C3A76] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Users className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm font-medium">No teams found</p>
        <p className="text-xs mt-1">Create teams first to assign ads</p>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
      <div className="space-y-3">
        {teams.map(team => {
          const assignedIds = teamAdsMap[team.id] || [];
          const assignedCount = assignedIds.length;
          const assignedNames = assignedIds
            .slice(0, 3)
            .map(id => campaigns.find(c => c.id === id)?.title)
            .filter(Boolean) as string[];

          return (
            <div key={team.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1C3A76]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#1C3A76] font-bold text-[16px]">
                    {(team.name || 'T')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-gray-800 truncate">{team.name}</p>
                  <p className="text-[12px] text-gray-400">
                    {team.members?.length ?? team.membersCount ?? team.memberCount ?? 0} members
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                  assignedCount > 0 ? 'bg-[#1C3A76]/10 text-[#1C3A76] border border-[#1C3A76]/20' : 'bg-gray-100 text-gray-400'
                }`}>
                  {assignedCount > 0 ? `${assignedCount} ads` : 'No ads'}
                </div>
              </div>

              {assignedCount > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {assignedNames.map(name => (
                    <span key={name} className="text-[10px] bg-[#EEF3FC] text-[#1C3A76] border border-[#1C3A76]/20 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                      {name}
                    </span>
                  ))}
                  {assignedCount > 3 && (
                    <span className="text-[10px] text-gray-400">+{assignedCount - 3} more</span>
                  )}
                </div>
              )}

              <button
                onClick={() => { setModalTeam(team); setModalLoading(false); }}
                className="mt-3 w-full py-2.5 bg-[#1C3A76] text-white text-[13px] font-medium rounded-xl hover:bg-[#162d5e] transition-colors"
              >
                {assignedCount > 0 ? 'Manage Assigned Ads' : 'Assign Ads'}
              </button>
            </div>
          );
        })}
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
