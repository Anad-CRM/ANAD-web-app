/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { LeadSummaryCard } from '@/modules/leads/details/components/LeadSummaryCard';
import { LeadFollowUpCard } from '@/modules/leads/details/components/LeadFollowUpCard';
import { useRouter, useParams } from 'next/navigation';
import { leadsApi } from '@/modules/leads/api/leadsApi';
import { activityService } from '@/modules/activities/services/activityService';
import { LeadActivityLog } from '@/modules/activities/components/LeadActivityLog';
import { Lead } from '@/modules/leads/types/lead.types';
import { Activity } from '@/modules/activities/types/activity.types';
import { getUser } from '@/core/utils/auth';
import { Text } from '@/core/components/ui/Text';
import { WhatsAppMessage } from '@/modules/leads/api/leadsApi';
import { WhatsAppMessagesCard } from './WhatsAppMessagesCard';
import { FormDetailsCard } from './FormDetailsCard';

export const LeadDetailsDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followups, setFollowups] = useState<Record<string, unknown>[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
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

      if (leadData) {
        setLead(leadData);

        const loggedInUser = getUser<{ id: string }>();
        const loggedInUserId = loggedInUser?.id || '';

        const userIdForFollowups = (leadData as unknown as { userId?: string })?.userId ?? '';

        // Step 3: Fetch activities, followups, and WhatsApp messages in parallel

        const [activitiesData, followupsData, whatsappData] = await Promise.all([
          activityService.fetchLeadActivities(leadId, loggedInUserId),
          leadsApi.fetchFollowupsByLead(leadId, userIdForFollowups),
          leadsApi.fetchWhatsAppMessages(leadId),
        ]);

        setActivities(activitiesData || []);
        setFollowups(followupsData || []);
        setWhatsappMessages(whatsappData || []);
      }
    } catch (error) {
      console.error('Failed to load lead details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-md flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">Lead Details</h1>
        </div> */}

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-md flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Text as="h1" weight="semibold" className="text-slate-800" style={{ fontSize: '20px' }}>Lead Details</Text>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="w-8 h-8 text-[#1C3A76] animate-spin" />
          </div>
        ) : !lead ? (
          <div className="flex items-center justify-center h-[50vh] text-slate-500 font-medium">
            <Text weight="medium" style={{ color: '#64748B' }}>Lead not found.</Text>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch h-full">
            {/* Left Column 60% */}
            <div className="flex flex-col gap-6 w-full lg:w-[60%] flex-1">
              <LeadSummaryCard lead={lead} onRefresh={loadData} />



              {/* <FormDetailsCard formData={lead.formData} /> */}

              <LeadActivityLog
                activities={activities}
                leadId={leadId}
                onRefresh={loadData}
              />
            </div>

            {/* Right Column 40% */}
            <div className="w-full lg:w-[40%] flex-shrink-0 gap-6 sticky top-4 flex flex-col">
              <FormDetailsCard formData={lead.formData} />
              <WhatsAppMessagesCard messages={whatsappMessages} leadId={leadId} />
              <LeadFollowUpCard
                followups={followups}
                leadId={leadId}
                assignedUserId={(lead as unknown as any)?.assignedUser?.id || (lead as unknown as any)?.assignedUser?._id || ''}
                onRefresh={loadData}
              />

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
