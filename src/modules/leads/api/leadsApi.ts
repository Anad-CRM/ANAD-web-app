/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/core/api/axios";
import { getUser } from "@/core/utils/auth";
import { API_ENDPOINTS } from "@/core/api/api";
import { Lead } from "../types/lead.types";

export interface FetchLeadsParams {
  keyword?: string;
  limit?: number;
  offset?: number;
  status?: string | string[] | null;
  userId?: string | null;
  staffId?: string | string[] | null;
  teamId?: string | string[] | null;
  filter?: string;
  startDate?: string;
  endDate?: string;
  sortByDate?: "latest" | "oldest";
  adId?: string | null;
  adIds?: string[] | null;
  isUnassigned?: boolean;
}

interface FetchLeadsResponse {
  status: string;
  message?: string;
  data: Lead[];
  totalCount?: number;
}

interface DeleteLeadResponse {
  status: string;
  message?: string;
}

export interface WhatsAppMessage {
  text: string;
  date: string;
  time: string;
}

export interface WhatsAppMessagesData {
  leadId: string;
  userName: string;
  messages: WhatsAppMessage[];
}

export interface WhatsAppMessagesResponse {
  success: boolean;
  data: WhatsAppMessagesData[];
}

export const leadsApi = {
  fetchLeads: async (params?: FetchLeadsParams): Promise<FetchLeadsResponse> => {
    const userData = getUser<Record<string, string>>();
    if (!userData?.organizationId) {
      console.warn("[leadsApi] No organizationId found in session.");
      return { status: "failed", data: [] };
    }

    const payload: Record<string, unknown> = {
      organizationId: userData.organizationId,
      offset: params?.offset ?? 0,
      limit: params?.limit ?? 20,
      keyword: params?.keyword?.trim() ?? "",
      filter: params?.filter ?? "Overall",
      sortByDate: params?.sortByDate ?? "latest",
    };

    if (params?.status) payload.status = params.status;
    if (params?.userId) payload.userId = params.userId;
    if (params?.staffId) payload.staffId = params.staffId;
    if (params?.teamId) payload.teamId = params.teamId;
    if (params?.adId) payload.adId = params.adId;
    if (params?.adIds?.length) payload.adIds = params.adIds;
    if (params?.startDate) payload.startDate = params.startDate;
    if (params?.endDate) payload.endDate = params.endDate;

    try {
      if (params?.isUnassigned) {
        const response = await api.post(API_ENDPOINTS.LEADS.UNASSIGNED, payload);
        return response.data;
      }

      const response = await api.post(API_ENDPOINTS.LEADS.GET_BY_STATUS, payload);
      return response.data;
    } catch (error) {
      console.error("[leadsApi] Error fetching leads:", error);
      throw error;
    }
  },

  assignLeads: async (leadIds: string[], staffId: string, shouldResetStatus = false): Promise<Record<string, unknown>> => {
    try {
      const response = await api.post(API_ENDPOINTS.LEADS.ASSIGN, { leadIds, staffMemberId: staffId, shouldResetStatus });
      // console.log("response -------- ", response);
      return response.data;
    } catch (error) {
      console.error("[leadsApi] Error assigning leads:", error);
      throw error;
    }
  },

  createActivity: async (leadId: string, payload: { title: string; description: string; userId: string }): Promise<Record<string, unknown>> => {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.CREATE(leadId), payload);
      return response.data;
    } catch (error) {
      console.error("[leadsApi] Error creating activity:", error);
      throw error;
    }
  },

  fetchLeadFromList: async (leadId: string): Promise<Lead | null> => {
    try {
      const response = await api.get(`${API_ENDPOINTS.LEADS.GET_BY_ID}?leadId=${leadId}`);
      if (response.data?.status === "success") {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("[leadsApi] Error fetching lead by ID:", error);
      return null;
    }
  },

  fetchFollowupsByLead: async (leadId: string, leadUserId?: string): Promise<Record<string, unknown>[]> => {
    try {
      const userId = leadUserId ?? '';
      console.log('[leadsApi] fetchFollowupsByLead →', { leadId, userId });
      const response = await api.post(API_ENDPOINTS.FOLLOW_UP.GET_BY_LEAD, { leadId, userId });
      console.log('[leadsApi] getAllFollowUpByLeads response:', response.data);
      if (response.data?.success === true) {
        return response.data.data || [];
      }
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
      const response = await api.post(API_ENDPOINTS.STAFF.GET_BY_ROLE,
        { organizationId: userData.organizationId, date }
      );

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

  fetchWhatsAppMessages: async (leadId: string): Promise<WhatsAppMessage[]> => {
    const userData = getUser<Record<string, string>>();
    if (!userData?.organizationId || !userData?.id) return [];

    try {
      const response = await api.post(API_ENDPOINTS.LEADS.WHATSAPP,
        {
          userId: userData.id,
          organizationId: userData.organizationId,
          leadId,
        },
      );

      if (response.data?.success === true && Array.isArray(response.data.data)) {
        const matchingLead = response.data.data.find((item: any) => item.leadId === leadId);
        return matchingLead?.messages || response.data.data[0]?.messages || [];
      }
      return [];
    } catch (error) {
      console.error("[leadsApi] Error fetching WhatsApp messages:", error);
      return [];
    }
  },

  deleteLead: async (leadId: string, deleteDuplicates = false): Promise<DeleteLeadResponse> => {
    const userData = getUser<Record<string, string>>();
    if (!userData?.organizationId) {
      return { status: "failed", message: "No organization found for this user" };
    }

    try {
      const response = await api.post(API_ENDPOINTS.LEADS.DELETE, {
        leadId,
        organizationId: userData.organizationId,
        deleteDuplicates,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return { status: "failed", message: err?.response?.data?.message || "Failed to delete lead" };
    }
  },

  getAutoAssignStatus: async (orgId: string): Promise<boolean> => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTO_LEAD.GET_AUTO_ASSIGN_STATUS(orgId));
      return response.data?.data?.organizationAutoAssign ?? false;
    } catch (error) {
      console.error("[leadsApi] Error fetching auto assign status:", error);
      return false;
    }
  },

  triggerAutoAssign: async (orgId: string): Promise<Record<string, unknown>> => {
    try {
      const response = await api.post("/autoAssign/trigger", { organizationId: orgId });
      return response.data;
    } catch (error) {
      console.error("[leadsApi] Error triggering auto assign:", error);
      throw error;
    }
  },
};
