import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { Activity } from "@/modules/activities/types/activity.types";

/**
 * Service for fetching and creating lead activities.
 */
export const activityService = {
  /** Fetch activities for a lead */
  fetchLeadActivities: async (
    leadId: string,
    assignedUserId?: string
  ): Promise<Activity[]> => {
    try {
      const userId = assignedUserId ?? "";
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.GET, { leadId, userId });
      if (response.data?.status === "success") {
        return (response.data.data as Activity[]) || [];
      }
      return [];
    } catch (error) {
      console.error("[activityService] Error fetching lead activities:", error);
      return [];
    }
  },

  /** Create a new activity for a lead */
  createActivity: async (
    leadId: string,
    payload: { title: string; description: string; userId: string }
  ): Promise<Record<string, unknown>> => {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.CREATE(leadId), payload);
      return response.data;
    } catch (error) {
      console.error("[activityService] Error creating activity:", error);
      throw error;
    }
  },
};
