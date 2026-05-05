import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";

export const activityService = {
  fetchLeadActivities: async (leadId: string, assignedUserId?: string): Promise<Record<string, unknown>[]> => {
    try {
      const userId = assignedUserId ?? '';
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.GET, { leadId, userId });
      if (response.data?.status === "success") {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("[activityService] Error fetching lead activities:", error);
      return [];
    }
  },

  createActivity: async (leadId: string, payload: { title: string; description: string; userId: string }): Promise<Record<string, unknown>> => {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.CREATE(leadId), payload);
      return response.data;
    } catch (error) {
      console.error("[activityService] Error creating activity:", error);
      throw error;
    }
  }
};
