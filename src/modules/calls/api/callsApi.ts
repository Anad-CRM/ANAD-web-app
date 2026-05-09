import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { CallAnalyticsResponse, CallLog } from "../types";
import { getUser } from "@/core/utils/auth";

export const getCallAnalytics = async (params?: Record<string, unknown>): Promise<CallAnalyticsResponse | null> => {
  try {
    const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
    const orgId = params?.organizationId || user?.organizationId;

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

export const getSpecificCallLogs = async (params: { 
    callType: string; 
    startDate?: string; 
    endDate?: string; 
    staffIds?: string[];
    limit?: number;
}): Promise<{ logs: CallLog[]; totalCount: number }> => {
    try {
      const user = getUser<{ organizationId?: string }>();
      const response = await api.post(API_ENDPOINTS.DASHBOARD.SPECIFIC_CALL_TYPE, {
        ...params,
        organizationId: user?.organizationId,
      });
      
      if (response.data.success) {
        const logs = response.data.data.callDetails.map((item: any) => ({
          id: item.id,
          number: item.number,
          callType: item.callType,
          duration: typeof item.duration === 'number' 
            ? `${Math.floor(item.duration / 60)}m ${item.duration % 60}s`
            : item.duration,
          timestamp: item.timestamp,
          recordingFile: item.recording?.fileName,
          userName: item.createdUserName,
          lead: item.lead ? {
            id: item.lead.id,
            userName: item.lead.userName,
            mobileNumber: item.lead.mobileNumber
          } : undefined,
          name: item.lead?.userName || item.lead?.name || item.name || item.leadName || item.customerName || "Unknown Lead"
        }));

        return {
            logs,
            totalCount: response.data.data.pagination?.totalRecords || logs.length
        };
      }
      return { logs: [], totalCount: 0 };
    } catch (error) {
      console.error("Failed to fetch specific call logs:", error);
      return { logs: [], totalCount: 0 };
    }
};

export const getStaffCallBreakdown = async (params?: Record<string, unknown>) => {
  try {
    const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
    const orgId = params?.organizationId || user?.organizationId;

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_AUTO_EOD, {
      params: { ...params, organizationId: orgId }
    });

    if (response.data.success) {
      return response.data.data.map((user: { eods: { userId: string, callStats: { totalCalls: number, totalIncomingCalls: number, totalMissedCalls: number, totalDuration: number } }[], userName: string }) => {
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
export const getRecordingUrl = (fileName: string): string => {
  return API_ENDPOINTS.CALLS.RECORDING(fileName);
};
