import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { getUser } from "@/core/utils/auth";
import { AutoLeadCampaign } from "../types";

export interface AutoAssignState {
  autoAssignLeads: boolean;
  attendanceRequired: boolean;
  selectedAdIds: string[];
  managerAutoAssignEnabled: boolean;
}

export interface StaffMember {
  id: string;
  userName: string;
  email: string;
  role: string;
}

export interface TeamItem {
  id: string;
  name: string;
  [key: string]: any;
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
        isLive: ad.isLive || false,
        platform: ad.platform || "Manual",
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
      if (!org) return { autoAssignLeads: false, attendanceRequired: false, selectedAdIds: [], managerAutoAssignEnabled: false };

      const [autoAssignRes, attendanceRes, managerRes] = await Promise.all([
         api.get(API_ENDPOINTS.AUTO_LEAD.GET_AUTO_ASSIGN_STATUS(org)),
         api.get(API_ENDPOINTS.AUTO_LEAD.GET_ATTENDANCE_STATUS(org)),
         api.get(API_ENDPOINTS.AUTO_LEAD.MANAGER_STATUS(org)).catch(() => ({ data: { data: {} } })),
      ]);

      const ads = autoAssignRes.data?.data?.ads || [];
      const selectedAdIds = ads.filter((ad: any) => ad.autoAssignLeads === true).map((ad: any) => ad.adId);

      return {
         autoAssignLeads: autoAssignRes.data?.data?.organizationAutoAssign ?? false,
         attendanceRequired: attendanceRes.data?.data?.attendanceRequiredForAutoAssign ?? false,
         selectedAdIds,
         managerAutoAssignEnabled: managerRes.data?.data?.managerAutoAssignLeads ?? false,
      };
   } catch (error) {
      console.error("Failed to fetch auto assign settings", error);
      return { autoAssignLeads: false, attendanceRequired: false, selectedAdIds: [], managerAutoAssignEnabled: false };
   }
};

export const toggleGlobalAutoAssign = async (status: boolean, adIds: string[], orgId?: number) => {
   const user = getUser<any>();
   const org = orgId || user?.organizationId;
   return api.post(API_ENDPOINTS.AUTO_LEAD.TOGGLE_AUTO_ASSIGN, { organizationId: org, autoAssign: status, adIds });
};

export const toggleGlobalAttendanceRequirement = async (status: boolean, orgId?: number) => {
   const user = getUser<any>();
   const org = orgId || user?.organizationId;
   return api.post(API_ENDPOINTS.AUTO_LEAD.TOGGLE_ATTENDANCE, { organizationId: org, status: status });
};

// ─── Team-Based APIs ─────────────────────────────────────────────────────────

export const getTeamAutoAssignStatus = async (teamId: string) => {
   try {
      const res = await api.get(API_ENDPOINTS.AUTO_LEAD.TEAM_STATUS(teamId));
      const ads = res.data?.data?.ads || [];
      const selectedAdIds: string[] = ads.filter((ad: any) => ad.autoAssignLeads === true).map((ad: any) => ad.adId);
      return { enabled: res.data?.data?.teamAutoAssign ?? false, selectedAdIds };
   } catch {
      return { enabled: false, selectedAdIds: [] };
   }
};

export const updateTeamAds = async (teamId: string, adIds: string[], orgId?: number) => {
   const user = getUser<any>();
   const org = orgId || user?.organizationId;
   return api.post(API_ENDPOINTS.AUTO_LEAD.TEAM_UPDATE_ADS, {
      teamId,
      organizationId: org,
      autoAssign: adIds.length > 0,
      adIds,
   });
};

// ─── Manager-Based APIs ───────────────────────────────────────────────────────

export const toggleManagerAutoAssign = async (status: boolean, orgId?: number) => {
   const user = getUser<any>();
   const org = orgId || user?.organizationId;
   return api.post(API_ENDPOINTS.AUTO_LEAD.MANAGER_TOGGLE, { organizationId: org, autoAssignLeads: status });
};

export const getManagerAdsStatus = async (managerId: string) => {
   try {
      const res = await api.get(API_ENDPOINTS.AUTO_LEAD.MANAGER_ADS_STATUS(managerId));
      const ads = res.data?.data?.ads || [];
      const selectedAdIds: string[] = ads.filter((ad: any) => ad.autoAssignLeads === true).map((ad: any) => ad.adId);
      return { selectedAdIds };
   } catch {
      return { selectedAdIds: [] };
   }
};

export const updateManagerAds = async (managerId: string, adIds: string[], orgId?: number) => {
   const user = getUser<any>();
   const org = orgId || user?.organizationId;
   return api.post(API_ENDPOINTS.AUTO_LEAD.MANAGER_UPDATE_ADS, {
      managerId,
      organizationId: org,
      autoAssign: adIds.length > 0,
      adIds,
   });
};

// ─── Lists ────────────────────────────────────────────────────────────────────

export const getManagersList = async (orgId?: number): Promise<StaffMember[]> => {
   try {
      const user = getUser<any>();
      const org = orgId || user?.organizationId;
      const res = await api.post(API_ENDPOINTS.STAFF.GET_BY_ROLE, { organizationId: org, role: 'manager' });
      return res.data?.data || [];
   } catch {
      return [];
   }
};

export const getTeamsList = async (orgId?: number): Promise<TeamItem[]> => {
   try {
      const user = getUser<any>();
      const org = orgId || user?.organizationId;
      const res = await api.post(API_ENDPOINTS.TEAM.GET_ALL, { organizationId: org });
      return res.data?.data || [];
   } catch {
      return [];
   }
};
