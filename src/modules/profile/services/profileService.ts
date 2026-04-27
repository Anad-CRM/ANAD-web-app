import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";

export interface UpdateProfileData {
  userId: string;
  userName?: string;
  email?: string;
  mobileNumber?: string;
  address?: string;
  organization?: {
    organizationName?: string;
    businessCategory?: string;
    startTime?: string;
    endTime?: string;
  };
  avatar?: string;
}

export const ProfileService = {
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.post(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
    return response.data;
  },
  uploadMedia: async (data: { name: string; file: string }) => {
    const response = await api.post(API_ENDPOINTS.FILE.UPLOAD, data);
    return response.data;
  }
};
