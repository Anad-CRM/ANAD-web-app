import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { CallAnalyticsResponse } from "../types";
import { getUser } from "@/core/utils/auth";

export const getCallAnalytics = async (params?: Record<string, any>): Promise<CallAnalyticsResponse | null> => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId || params?.organizationId;

    const response = await api.post(API_ENDPOINTS.DASHBOARD.CALLS_ANALYTICS, {
      ...params,
      organizationId: orgId,
    });
    return response.data?.data || null;
  } catch (error) {
    console.error("Failed to fetch call analytics:", error);
    return null;
  }
};

export const getStaffCallBreakdown = async (params?: Record<string, any>) => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId || params?.organizationId;

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_AUTO_EOD, {
      params: { ...params, organizationId: orgId }
    });

    if (response.data.success) {
      return response.data.data.map((user: any) => {
        const stats = user.eods[0]?.callStats || {};
        return {
          id: user.eods[0]?.userId || Math.random().toString(),
          name: user.userName,
          avatarUrl: undefined,
          callsMade: stats.totalCalls || 0,
          received: stats.totalIncomingCalls || 0,
          missed: stats.totalMissedCalls || 0,
          avgDuration: stats.totalDuration && stats.totalCalls 
            ? `${Math.floor((stats.totalDuration / stats.totalCalls) / 60)}:${String(Math.floor((stats.totalDuration / stats.totalCalls) % 60)).padStart(2, '0')}`
            : "0:00"
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch staff call breakdown:", error);
    return [];
  }
};
