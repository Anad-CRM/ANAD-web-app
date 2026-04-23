import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { LeadSummaryCard } from '@/modules/leads/details/components/LeadSummaryCard';
import { LeadHistoryCard } from '@/modules/leads/details/components/LeadHistoryCard';
import { LeadFollowUpCard } from '@/modules/leads/details/components/LeadFollowUpCard';
import { useRouter, useParams } from 'next/navigation';
import { leadsApi } from '@/modules/leads/api/leadsApi';
import { Lead } from '@/modules/leads/types/lead.types';

export const LeadDetailsDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!leadId) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Step 1: Fetch lead first (mirrors Flutter: leadData passed as prop)
        const leadData = await leadsApi.fetchLeadFromList(leadId);
        if (leadData) setLead(leadData);

        // Step 2: The backend checks activity/followup ownership against the
        // ASSIGNED user's ID (not the logged-in admin). Mirror Flutter behavior
        // where these calls use the lead's assignedTo field.
        const assignedUserId = leadData?.assignedTo || leadData?.assignedUser?.id || leadData?.userId;

        // Step 3: Fetch activities and followups in parallel using correct userId
        const [activitiesData, followupsData] = await Promise.all([
          leadsApi.fetchLeadActivities(leadId, assignedUserId),
          leadsApi.fetchFollowupsByLead(leadId, assignedUserId),
        ]);

        setActivities(activitiesData || []);
        setFollowups(followupsData || []);
      } catch (error) {
        console.error("Failed to load lead details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [leadId]);

  return (
    <div className="flex flex-col w-full h-full bg-[#E5ECF4] p-4 lg:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-md flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">Lead Details</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="w-8 h-8 text-[#1C3A76] animate-spin" />
          </div>
        ) : !lead ? (
          <div className="flex items-center justify-center h-[50vh] text-slate-500 font-medium">
            Lead not found.
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column 60% */}
            <div className="flex flex-col gap-8 w-full lg:w-[60%]">
              <LeadSummaryCard lead={lead} />
              <LeadHistoryCard activities={activities} />
            </div>
            
            {/* Right Column 40% */}
            <div className="w-full lg:w-[40%] flex-shrink-0 sticky top-4">
              <LeadFollowUpCard followups={followups} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
