import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { LeadCountsData, StaffEodSummary } from "../types";
import { getUser, getToken } from "@/core/utils/auth";

export const getLeadSummary = async (params?: Record<string, any>): Promise<LeadCountsData | null> => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId || params?.organizationId;

    const response = await api.request({
      url: API_ENDPOINTS.DASHBOARD.GET_LEAD_COUNTS,
      method: "GET",
      params: { ...params, organizationId: orgId }
    });
    return response.data?.data || null;
  } catch (error) {
    console.error("Failed to fetch lead counts", error);
    return null;
  }
};

export const getEodReports = async (params?: Record<string, any>): Promise<StaffEodSummary[]> => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId || params?.organizationId;

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_AUTO_EOD, { 
       params: { ...params, organizationId: orgId } 
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch EOD reports", error);
    return [];
  }
};
