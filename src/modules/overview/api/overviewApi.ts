import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { LeadCountsData, StaffEodSummary } from "../types";
import { getUser } from "@/core/utils/auth";

export const getLeadSummary = async (params?: {
  filter?: string;
  customStartDate?: string;
  customEndDate?: string;
  teamId?: string;
  staffId?: string;
}): Promise<LeadCountsData | null> => {
  try {
    const user = getUser<any>();
    // Mirrors the Flutter model: prefer organization.id, fall back to organizationId
    const orgId = user?.organization?.id || user?.organizationId;

    const queryParams: Record<string, any> = {
      filter: params?.filter || "Overall",
      organizationId: orgId,
    };

    if (params?.customStartDate) queryParams.customStartDate = params.customStartDate;
    if (params?.customEndDate) queryParams.customEndDate = params.customEndDate;
    if (params?.teamId) queryParams.teamId = params.teamId;
    if (params?.staffId) queryParams.staffId = params.staffId;

    const response = await api.post(API_ENDPOINTS.DASHBOARD.GET_FILTERED_LEAD_COUNT, queryParams);

    if (response.data?.status !== "success") return null;
    

    // The backend returns: { data: { leadCounts: { newLeadCount, hotLeadCount, ... }, staffLeadCounts: [...] } }
    const raw = response.data?.data;
    const lc = raw?.leadCounts ?? {};

    // Normalise into LeadCountsData so the UI always has consistent field names
    return {
      totalLeads: lc.allLeadsCount ?? 0,
      unAssignedCount: lc.unAssignedLeadCount ?? 0,
      leadCounts: lc,
      staffLeadCounts: raw?.staffLeadCounts ?? [],
      // Also populate the legacy statusCounts shape so nothing breaks
      statusCounts: {
        newLead: lc.newLeadCount ?? 0,
        hotLead: lc.hotLeadCount ?? 0,
        closed: lc.closedLeadCount ?? 0,
        registered: lc.registerCount ?? 0,
        followUp: lc.followUpCount ?? 0,
        // new-shape fields too
        newLeadCount: lc.newLeadCount,
        hotLeadCount: lc.hotLeadCount,
        closedLeadCount: lc.closedLeadCount,
        registerCount: lc.registerCount,
        followUpCount: lc.followUpCount,
        unAssignedLeadCount: lc.unAssignedLeadCount,
        allLeadsCount: lc.allLeadsCount,
        totalClosedCount: lc.totalClosedCount,
        totalAssignedCount: lc.totalAssignedCount,
        // rnrCount: lc.rnrCount ?? 0,
        rnr: lc.rnrCount ?? 0,
      },
    };
  } catch (error: any) {
    console.error("[API Error] Failed to fetch lead counts:", error?.response?.status, error?.message);
    return null;
  }
};

export const getEodReports = async (params?: Record<string, any>): Promise<StaffEodSummary[]> => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId;

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_AUTO_EOD, {
      params: { ...params, organizationId: orgId }
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch EOD reports", error);
    return [];
  }
};

