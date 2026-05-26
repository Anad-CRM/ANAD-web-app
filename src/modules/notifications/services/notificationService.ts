import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";

export interface GetNotificationsParams {
  userId: string;
  offset: number;
  limit: number;
}

export const NotificationService = {
  getNotifications: async (params: GetNotificationsParams) => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.GET_BY_USER, params);
    return response.data;
  },
};
