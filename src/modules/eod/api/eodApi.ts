import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { EodStaffMember } from "../types";
import { getUser } from "@/core/utils/auth";

export const getEodStaffSummary = async (filters: { 
  startDate?: string; 
  endDate?: string; 
  staffIds?: string[]; 
  teamIds?: string[];
  organizationId?: string;
} = {}): Promise<EodStaffMember[]> => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  const orgId = user?.organizationId || filters.organizationId;

  if (!orgId) return [];

  try {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_AUTO_EOD, {
      params: { 
        ...filters, 
        organizationId: orgId,
        // Ensure staffIds and teamIds are handled if they are arrays (depending on how axios/backend expects them)
      }
    });

    if (response.data?.success) {
      return response.data.data.map((item: any) => ({
        userId: item.eods[0]?.userId,
        userName: item.userName || "Unknown User",
        role: item.eods[0]?.role || "Staff",
        submitted: item.submitted,
        callStats: item.eods[0]?.callStats || {},
        leadStats: item.eods[0]?.leadStats || {},
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch EOD summary:", error);
    return [];
  }
};

export const setEodMode = async (mode: 'auto' | 'manual'): Promise<boolean> => {
  try {
    const user = getUser<{ organizationId?: string }>();
    if (!user?.organizationId) return false;

    const response = await api.post(API_ENDPOINTS.DASHBOARD.SET_EOD_MODE, {
      organizationId: user.organizationId,
      eodMode: mode,
    });

    return response.data?.success || false;
  } catch (error) {
    console.error("Failed to set EOD mode:", error);
    return false;
  }
};

export const getEodFields = async (): Promise<any[]> => {
  try {
    const user = getUser<{ organizationId?: string }>();
    if (!user?.organizationId) return [];

    const response = await api.get(API_ENDPOINTS.DASHBOARD.EOD_FIELDS, {
      params: { organizationId: user.organizationId }
    });

    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch EOD fields:", error);
    return [];
  }
};

export const createEodField = async (data: any): Promise<boolean> => {
  try {
    const user = getUser<{ organizationId?: string }>();
    if (!user?.organizationId) return false;

    const response = await api.post(API_ENDPOINTS.DASHBOARD.CREATE_EOD_FIELD, {
      ...data,
      organizationId: user.organizationId
    });

    return response.data?.success || false;
  } catch (error) {
    console.error("Failed to create EOD field:", error);
    return false;
  }
};

export const updateEodField = async (id: string | number, data: any): Promise<boolean> => {
  try {
    const response = await api.put(API_ENDPOINTS.DASHBOARD.UPDATE_EOD_FIELD(id), data);
    return response.data?.success || false;
  } catch (error) {
    console.error("Failed to update EOD field:", error);
    return false;
  }
};

export const deleteEodField = async (id: string | number): Promise<boolean> => {
  try {
    const response = await api.delete(API_ENDPOINTS.DASHBOARD.DELETE_EOD_FIELD(id));
    return response.data?.success || false;
  } catch (error) {
    console.error("Failed to delete EOD field:", error);
    return false;
  }
};
