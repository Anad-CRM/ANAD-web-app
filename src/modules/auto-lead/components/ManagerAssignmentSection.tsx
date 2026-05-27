import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { AutoLeadCampaign } from '../types';
import { StaffMember, getManagersList, getManagerAdsStatus, updateManagerAds } from '../api/autoLeadApi';
import { DistributionAssignModal } from './DistributionAssignModal';
import { Text } from '@/core/components/ui/Text';
import { COLORS } from '@/core/components/theme/colors';

interface Props {
  campaigns: AutoLeadCampaign[];
}

export const ManagerAssignmentSection: React.FC<Props> = ({ campaigns }) => {
  const [managers, setManagers] = useState<StaffMember[]>([]);
  const [managerAdsMap, setManagerAdsMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [modalManager, setModalManager] = useState<StaffMember | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadManagers = async () => {
    setLoading(true);
    const list = await getManagersList();
    setManagers(list);

    const results = await Promise.all(
      list.map(async m => {
        const status = await getManagerAdsStatus(m.id);
        return { id: m.id, ids: status.selectedAdIds };
      })
    );

    const map: Record<string, string[]> = {};
    results.forEach(r => {
      map[r.id] = r.ids;
    });

    setManagerAdsMap(map);
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => loadManagers());
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApply = async (managerId: string, adIds: string[]) => {
    try {
      await updateManagerAds(managerId, adIds);
      setManagerAdsMap(prev => ({ ...prev, [managerId]: adIds }));
      showToast(adIds.length === 0 ? 'Cleared all ads from manager' : `Assigned ${adIds.length} ads to manager`, 'success');
    } catch {
      showToast('Failed to update manager ads', 'error');
      throw new Error('Failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-9 h-9 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.violet }} />
      </div>
    );
  }

  if (managers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 m-4 sm:m-5">
        <UserCheck className="w-12 h-12 text-gray-300 mb-3" />
        <Text weight="bold" className="text-gray-800 block" style={{ fontSize: '14px' }}>
          No Managers Found
        </Text>
        <Text className="text-gray-400 block mt-1 max-w-[280px]" style={{ fontSize: '12px', lineHeight: '1.55' }}>
          No managers are available in this organization. You must assign manager roles to team members in CRM settings first.
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
        <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-purple-600/50 overflow-hidden relative">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <UserCheck className="w-40 h-40 text-white" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <Text as="h3" weight="bold" className="text-white block" style={{ fontSize: '15.5px', letterSpacing: '0.02em' }}>
                  Manager-Based Lead Routing
                </Text>
              </div>
              <Text className="text-white/85 block max-w-[600px]" style={{ fontSize: '12.5px', lineHeight: '1.65' }}>
                Assign campaigns directly to specific department heads or group managers. Incoming leads will route directly to team members managed under their respective assigned portfolios.
              </Text>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {managers.map(manager => {
            const assignedIds = managerAdsMap[manager.id] || [];
            const assignedCount = assignedIds.length;
            const assignedNames = assignedIds
              .slice(0, 3)
              .map(id => campaigns.find(c => c.id === id)?.title)
              .filter(Boolean) as string[];

            return (
              <div key={manager.id} className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col justify-between relative group h-full">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/80 border border-purple-200/50 flex items-center justify-center flex-shrink-0 text-purple-700 font-bold text-[17px] shadow-xs">
                        {(manager.userName || 'M')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Text weight="bold" className="text-gray-800 block truncate group-hover:text-purple-700 transition-colors" style={{ fontSize: '15px' }}>
                          {manager.userName || 'Manager'}
                        </Text>
                        <Text className="text-gray-400 block mt-0.5 font-medium truncate" style={{ fontSize: '12px' }}>
                          {manager.email || 'No email registered'}
                        </Text>
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg text-[12px] font-bold tracking-wide shrink-0 self-start sm:self-auto ${
                        assignedCount > 0
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60 shadow-xs'
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
                          className="text-[10px] font-bold bg-purple-50/50 text-purple-700 border border-purple-200/50 px-2 py-0.5 rounded-md truncate max-w-[125px] hover:bg-purple-100 transition-colors"
                          title={name}
                        >
                          {name}
                        </span>
                      ))}
                      {assignedCount > 3 && (
                        <span className="text-[10px] text-purple-400 font-bold bg-purple-50/30 border border-dashed border-purple-200/50 px-1.5 py-0.5 rounded-md">
                          +{assignedCount - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 p-3 rounded-xl border border-purple-100/50 bg-purple-50/20 transition-all duration-300 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs">💼</span>
                        <Text weight="bold" className="text-gray-700 block" style={{ fontSize: '12.5px' }}>
                          Portfolio Status
                        </Text>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border bg-purple-100/60 text-purple-700 border-purple-200/40">
                          Active
                        </span>
                      </div>
                      <Text className="text-gray-400 block mt-0.5 truncate font-medium" style={{ fontSize: '11px' }}>
                        {assignedCount > 0 ? `Assigned to ${assignedCount} live campaign portfolios` : 'Awaiting portfolio campaign assignment'}
                      </Text>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setModalManager(manager)}
                  className="mt-4 w-full py-2.5 bg-white border border-gray-200 text-purple-700 hover:bg-purple-700 hover:text-white text-[12.5px] sm:text-[13px] font-bold rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-purple-700/10 cursor-pointer transform hover:scale-[1.01]"
                >
                  {assignedCount > 0 ? 'Manage Assigned Ads' : 'Assign Campaigns'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {modalManager && (
        <DistributionAssignModal
          title={modalManager.userName || 'Manager'}
          subtitle="Select ads to assign to this manager"
          campaigns={campaigns}
          initialSelectedIds={managerAdsMap[modalManager.id] || []}
          onClose={() => setModalManager(null)}
          onApply={ids => handleApply(modalManager.id, ids)}
        />
      )}
    </>
  );
};
