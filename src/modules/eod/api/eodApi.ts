import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { EodStaffMember } from "../types";
import { getUser } from "@/core/utils/auth";

export const getEodStaffSummary = async (params?: Record<string, unknown>): Promise<EodStaffMember[]> => {
  try {
    const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
    const orgId = user?.organizationId || params?.organizationId;

    if (!orgId) return [];

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_AUTO_EOD, {
      params: { ...params, organizationId: orgId }
    });

    if (response.data?.success) {
      return response.data.data.map((item: { eods: { userId: string, role: string, callStats: unknown, leadStats: unknown }[], userName: string, submitted: boolean }) => ({
        userId: item.eods[0]?.userId,
        userName: item.userName || "Unknown User",
        role: item.eods[0]?.role || "Staff",
        submitted: item.submitted,
        callStats: item.eods[0]?.callStats as never,
        leadStats: item.eods[0]?.leadStats as never,
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch EOD summary:", error);
    return [];
  }
};
