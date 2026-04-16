import React, { useEffect, useState } from 'react';
import { AutoLeadHeader } from './AutoLeadHeader';
import { DistributionInfoCard } from './DistributionInfoCard';
import { AutoAssignSettingsCard } from './AutoAssignSettingsCard';
import { CampaignSelectionArea } from './CampaignSelectionArea';
import { getLiveAds, getAutoAssignParams, toggleGlobalAutoAssign, toggleGlobalAttendanceRequirement } from '../api/autoLeadApi';
import { AutoLeadCampaign } from '../types';

export const AutoLeadDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AutoLeadCampaign[]>([]);
  const [autoAssign, setAutoAssign] = useState(false);
  const [attendanceReq, setAttendanceReq] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [adsRes, paramsRes] = await Promise.all([
         getLiveAds(),
         getAutoAssignParams()
      ]);
      setCampaigns(adsRes);
      setAutoAssign(paramsRes.autoAssignLeads);
      setAttendanceReq(paramsRes.attendanceRequired);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleToggleAutoAssign = async () => {
      const newVal = !autoAssign;
      setAutoAssign(newVal);
      await toggleGlobalAutoAssign(newVal);
  };

  const handleToggleAttendance = async () => {
      const newVal = !attendanceReq;
      setAttendanceReq(newVal);
      await toggleGlobalAttendanceRequirement(newVal);
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center font-sans h-full">
        <div className="w-12 h-12 border-4 border-[#1C3A76] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full font-sans h-full relative pb-20">
      <div className="px-6 pt-2 w-full max-w-[1400px] mx-auto">
        <AutoLeadHeader />
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mt-2">
           <DistributionInfoCard />
           <AutoAssignSettingsCard 
             autoAssign={autoAssign} 
             onToggleAutoAssign={handleToggleAutoAssign}
             attendanceReq={attendanceReq}
             onToggleAttendance={handleToggleAttendance}
             activeAdsCount={campaigns.filter(c => c.isLive).length}
           />
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden w-full max-w-[1400px] mx-auto flex flex-col mb-4">
        <CampaignSelectionArea campaigns={campaigns} />
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
         <button className="bg-[#1C3A76] text-white text-sm px-20 py-3.5 rounded-[14px] font-semibold shadow-lg hover:shadow-xl transition-all">
           Apply Ads
         </button>
      </div>
    </div>
  );
};
