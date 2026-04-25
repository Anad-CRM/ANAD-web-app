import { api } from "@/core/api/axios";
import { getUser } from "@/core/utils/auth";
import { Lead } from "../types/lead.types";

// Mirrors the Flutter LeadListHelper.fetchLeads payload structure
export interface FetchLeadsParams {
  keyword?: string;
  limit?: number;
  offset?: number;
  status?: string | string[] | null;
  userId?: string | null;
  staffId?: string | string[] | null;
  teamId?: string | string[] | null;
  filter?: string; // 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Last Month' | 'Custom' | 'Overall'
  startDate?: string;
  endDate?: string;
  sortByDate?: "latest" | "oldest";
  adId?: string | null;
  adIds?: string[] | null;
}

interface FetchLeadsResponse {
  status: string;
  message?: string;
  data: Lead[];
  totalCount?: number;
}

export const leadsApi = {
  fetchLeads: async (params?: FetchLeadsParams): Promise<FetchLeadsResponse> => {
    // Inject organizationId from the logged-in user session (mirrors Flutter's userData)
    const userData = getUser<Record<string, string>>();
    if (!userData?.organizationId) {
      console.warn("[leadsApi] No organizationId found in session.");
      return { status: "failed", data: [] };
    }

    const payload: Record<string, unknown> = {
      organizationId: userData.organizationId,
      offset: params?.offset ?? 0,
      limit: params?.limit ?? 30,
      keyword: params?.keyword?.trim() ?? "",
      filter: params?.filter ?? "Overall",
      sortByDate: params?.sortByDate ?? "latest",
    };

    // Only append params if they have real values (avoid sending null/undefined noisily)
    if (params?.status) payload.status = params.status;
    if (params?.userId) payload.userId = params.userId;
    if (params?.staffId) payload.staffId = params.staffId;
    if (params?.teamId) payload.teamId = params.teamId;
    if (params?.adId) payload.adId = params.adId;
    if (params?.adIds?.length) payload.adIds = params.adIds;
    if (params?.startDate) payload.startDate = params.startDate;
    if (params?.endDate) payload.endDate = params.endDate;

    try {
      // Backend expects POST (confirmed by Flutter using req.post for this endpoint)
      const response = await api.post("/lead/getLeadsByStatus", payload);
      return response.data;
    } catch (error) {
      console.error("[leadsApi] Error fetching leads:", error);
      throw error;
    }
  },

  createActivity: async (leadId: string, payload: { title: string; description: string; userId: string }): Promise<any> => {
    try {
      const response = await api.post(`/lead/${leadId}/createActivity`, payload);
      return response.data;
    } catch (error) {
      console.error("[leadsApi] Error creating activity:", error);
      throw error;
    }
  },

  // NOTE: Backend has no GET /lead/getLeadById route.
  // Instead, we fetch the lead from the lead list (getLeadsByStatus) using its ID.
  // We use a large limit + Overall filter to maximise the chance of finding the lead.
  fetchLeadFromList: async (leadId: string): Promise<Lead | null> => {
    const userData = getUser<Record<string, string>>();
    if (!userData?.organizationId) return null;

    // Helper to search within a page of results
    const searchPage = async (offset: number, limit: number): Promise<Lead | null> => {
      const response = await api.post("/lead/getLeadsByStatus", {
        organizationId: userData.organizationId,
        offset,
        limit,
        filter: "Overall",
        sortByDate: "latest",
      });
      if (response.data?.status === "success" && Array.isArray(response.data.data)) {
        return response.data.data.find((l: Lead) => l.id === leadId) ?? null;
      }
      return null;
    };

    try {
      // First try a large first page (covers most cases)
      const firstPage = await searchPage(0, 500);
      if (firstPage) return firstPage;

      // If not found, try fetching the next 500 (handles large orgs)
      const secondPage = await searchPage(500, 500);
      return secondPage;
    } catch (error) {
      console.error("[leadsApi] Error fetching lead from list:", error);
      return null;
    }
  },

  // Mirrors Flutter activity_list_screen._fetchActivities():
  // userId = leadData['assignedUser']['id'] ?? ''
  // Always makes the call even with empty userId.
  fetchLeadActivities: async (leadId: string, assignedUserId?: string): Promise<any[]> => {
    try {
      // Flutter sends assignedUser['id'] — empty string if not assigned. Never skips.
      const userId = assignedUserId ?? '';
      console.log('[leadsApi] fetchLeadActivities →', { leadId, userId });
      const response = await api.post("/lead/getActivities", { leadId, userId });
      console.log('[leadsApi] getActivities response:', response.data);
      if (response.data?.status === "success") {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("[leadsApi] Error fetching lead activities:", error);
      return [];
    }
  },

  // Mirrors Flutter follow_up_page._fetchFollowUps():
  // userId = leadData['userId']  (the lead's raw userId field, NOT assignedUser.id)
  // leadId = leadData['id']
  fetchFollowupsByLead: async (leadId: string, leadUserId?: string): Promise<any[]> => {
    try {
      const userId = leadUserId ?? '';
      console.log('[leadsApi] fetchFollowupsByLead →', { leadId, userId });
      const response = await api.post("/followup/getAllFollowUpByLeads", { leadId, userId });
      console.log('[leadsApi] getAllFollowUpByLeads response:', response.data);
      // Flutter checks result['success'] == true (not status)
      if (response.data?.success === true) {
        return response.data.data || [];
      }
      // Also handle status-based response shape as fallback
      if (response.data?.status === "success") {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("[leadsApi] Error fetching followups:", error);
      return [];
    }
  },

  fetchStaffMembers: async (): Promise<unknown[]> => {
    const userData = getUser<Record<string, string>>();
    if (!userData?.organizationId) return [];
    try {
      const date = new Date().toISOString().split("T")[0];
      const response = await api.post("/staff/getStaffByRole", {
        params: { organizationId: userData.organizationId, date }
      });

      if (response.data?.status === "success") {
        const data = response.data.data;
        const combined: unknown[] = [];
        if (userData.role === "Admin" || userData.role === "Manager") {
          if (data?.admins) combined.push(...data.admins);
          if (data?.managers) combined.push(...data.managers);
        }
        if (data?.teamLeaders) combined.push(...data.teamLeaders);
        if (data?.staffMembers) combined.push(...data.staffMembers);
        return combined.filter((s: any) => s.id !== userData.id);
      }
    } catch {/* ignore */ }
    return [];
  },
};
