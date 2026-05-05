import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { AutoLeadCampaign } from '../types';
import { StaffMember, getManagersList, getManagerAdsStatus, updateManagerAds } from '../api/autoLeadApi';
import { DistributionAssignModal } from './DistributionAssignModal';

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
      list.map(async (m) => {
        const status = await getManagerAdsStatus(m.id);
        return { id: m.id, ids: status.selectedAdIds };
      })
    );
    const map: Record<string, string[]> = {};
    results.forEach(r => { map[r.id] = r.ids; });
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
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (managers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <UserCheck className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm font-medium">No managers found</p>
        <p className="text-xs mt-1">No managers are available in this organisation</p>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
      <div className="space-y-3">
        {managers.map(manager => {
          const assignedIds = managerAdsMap[manager.id] || [];
          const assignedCount = assignedIds.length;
          const assignedNames = assignedIds
            .slice(0, 3)
            .map(id => campaigns.find(c => c.id === id)?.title)
            .filter(Boolean) as string[];

          return (
            <div key={manager.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-[16px]">
                    {(manager.userName || 'M')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-gray-800 truncate">
                    {manager.userName || 'Manager'}
                  </p>
                  {manager.email && (
                    <p className="text-[12px] text-gray-400 truncate">{manager.email}</p>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                  assignedCount > 0 ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-gray-100 text-gray-400'
                }`}>
                  {assignedCount > 0 ? `${assignedCount} ads` : 'No ads'}
                </div>
              </div>

              {assignedCount > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {assignedNames.map(name => (
                    <span key={name} className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                      {name}
                    </span>
                  ))}
                  {assignedCount > 3 && (
                    <span className="text-[10px] text-gray-400">+{assignedCount - 3} more</span>
                  )}
                </div>
              )}

              <button
                onClick={() => setModalManager(manager)}
                className="mt-3 w-full py-2.5 bg-purple-600 text-white text-[13px] font-medium rounded-xl hover:bg-purple-700 transition-colors"
              >
                {assignedCount > 0 ? 'Manage Assigned Ads' : 'Assign Ads'}
              </button>
            </div>
          );
        })}
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
