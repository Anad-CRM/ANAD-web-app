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

  const loadData = async () => {
    if (!leadId) return;
    setIsLoading(true);
    try {
      // Step 1: Try reading the lead from sessionStorage cache first.
      // LeadList stores the lead object when a card is clicked — this avoids
      // a blind list re-fetch and ensures we have the correct userId fields.
      let leadData: Lead | null = null;
      try {
        const cached = sessionStorage.getItem(`lead_cache_${leadId}`);
        if (cached) {
          leadData = JSON.parse(cached) as Lead;
          console.log('[LeadDetailsDashboard] ✅ Lead loaded from sessionStorage cache');
        }
      } catch { }

      // Fall back to API search if cache miss
      if (!leadData) {
        console.log('[LeadDetailsDashboard] 📡 Cache miss — fetching lead from API...');
        leadData = await leadsApi.fetchLeadFromList(leadId);
      }

      if (leadData) setLead(leadData);

      // --- Mirrors Flutter exactly ---
      // Activities: userId = leadData['assignedUser']['id'] ?? ''
      // Followups:  userId = leadData['userId'] ?? ''
      const assignedUserIdForActivities =
        (leadData as any)?.assignedUser?.id ||
        (leadData as any)?.assignedUser?._id ||
        '';

      // Followups use the lead's own userId field (NOT assignedUser.id)
      const userIdForFollowups = (leadData as any)?.userId ?? '';

      console.log('[LeadDetailsDashboard] leadId:', leadId);
      console.log('[LeadDetailsDashboard] assignedUser.id (for activities):', assignedUserIdForActivities);
      console.log('[LeadDetailsDashboard] leadData.userId (for followups):', userIdForFollowups);
      console.log('[LeadDetailsDashboard] full leadData:', JSON.stringify(leadData));

      // Step 3: Fetch activities and followups in parallel
      const [activitiesData, followupsData] = await Promise.all([
        leadsApi.fetchLeadActivities(leadId, assignedUserIdForActivities),
        leadsApi.fetchFollowupsByLead(leadId, userIdForFollowups),
      ]);

      setActivities(activitiesData || []);
      setFollowups(followupsData || []);
    } catch (error) {
      console.error('Failed to load lead details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [leadId]);

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20">
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
              <LeadSummaryCard lead={lead} onRefresh={loadData} />
              <LeadFollowUpCard 
                followups={followups} 
                leadId={leadId}
                assignedUserId={(lead as any)?.assignedUser?.id || (lead as any)?.assignedUser?._id || ''}
                onRefresh={loadData}
              />
            </div>

            {/* Right Column 40% */}
            <div className="w-full lg:w-[40%] flex-shrink-0 sticky top-4">
              <LeadHistoryCard 
                activities={activities} 
                leadId={leadId}
                onRefresh={loadData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
