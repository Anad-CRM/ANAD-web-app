/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const summaryCardRef = useRef<HTMLDivElement | null>(null);
  const [summaryCardHeight, setSummaryCardHeight] = useState<number | null>(null);

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

  useEffect(() => {
    const element = summaryCardRef.current;
    if (!element) return;

    const updateHeight = () => {
      setSummaryCardHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [lead, activities, followups, whatsappMessages]);

  return (
    <div className="flex flex-col w-full min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20">
      <div className="max-w-[1400px] mx-auto w-full px-0 sm:px-1">
        {/* <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-md flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">Lead Details</h1>
        </div> */}

        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-md flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <Text as="h1" weight="semibold" className="text-slate-800" style={{ fontSize: '18px' }}>Lead Details</Text>
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            <div ref={summaryCardRef} className="h-fit self-start">
              <LeadSummaryCard lead={lead} onRefresh={loadData} />
            </div>
            <div className="h-full">
              <FormDetailsCard
                formData={lead.formData}
                style={summaryCardHeight ? { height: `${summaryCardHeight}px` } : undefined}
              />
            </div>

            <div className="h-full">
              <LeadActivityLog
                activities={activities}
                leadId={leadId}
                onRefresh={loadData}
              />
            </div>
            <div className="h-full">
              <LeadFollowUpCard
                followups={followups}
                leadId={leadId}
                assignedUserId={(lead as unknown as any)?.assignedUser?.id || (lead as unknown as any)?.assignedUser?._id || ''}
                onRefresh={loadData}
              />
            </div>

            {whatsappMessages.length > 0 && (
              <div className="xl:col-span-2">
                <WhatsAppMessagesCard messages={whatsappMessages} leadId={leadId} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
