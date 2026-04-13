import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { getUser } from "@/core/utils/auth";
import { AutoLeadCampaign } from "../types";

export interface AutoAssignState {
  autoAssignLeads: boolean;
  attendanceRequired: boolean;
}

export const getLiveAds = async (orgId?: number): Promise<AutoLeadCampaign[]> => {
  try {
    const user = getUser<any>();
    const org = orgId || user?.organizationId;
    if (!org) return [];
    
    const response = await api.get(API_ENDPOINTS.AUTO_LEAD.GET_LIVE_ADS(org));
    
    if (response.data && response.data.data) {
      return response.data.data.map((ad: any) => ({
        id: ad.adId,
        title: ad.adName || "Unnamed Campaign",
        leadsCount: ad.leadCount || 0,
        isLive: ad.isLive || false
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch live ads", error);
    return [];
  }
};

export const getAutoAssignParams = async (orgId?: number): Promise<AutoAssignState> => {
   try {
      const user = getUser<any>();
      const org = orgId || user?.organizationId;
      if (!org) return { autoAssignLeads: false, attendanceRequired: false };

      const [autoAssignRes, attendanceRes] = await Promise.all([
         api.get(API_ENDPOINTS.AUTO_LEAD.GET_AUTO_ASSIGN_STATUS(org)),
         api.get(API_ENDPOINTS.AUTO_LEAD.GET_ATTENDANCE_STATUS(org))
      ]);

      return {
         autoAssignLeads: autoAssignRes.data?.data?.autoAssignLeads ?? false,
         attendanceRequired: attendanceRes.data?.data?.attendanceRequiredForAutoAssign ?? false
      };
   } catch (error) {
      console.error("Failed to fetch auto assign settings", error);
      return { autoAssignLeads: false, attendanceRequired: false };
   }
};

export const toggleGlobalAutoAssign = async (status: boolean, orgId?: number) => {
   const user = getUser<any>();
   const org = orgId || user?.organizationId;
   return api.post(API_ENDPOINTS.AUTO_LEAD.TOGGLE_AUTO_ASSIGN, { organizationId: org, status: status });
};

export const toggleGlobalAttendanceRequirement = async (status: boolean, orgId?: number) => {
   const user = getUser<any>();
   const org = orgId || user?.organizationId;
   return api.post(API_ENDPOINTS.AUTO_LEAD.TOGGLE_ATTENDANCE, { organizationId: org, status: status });
};
