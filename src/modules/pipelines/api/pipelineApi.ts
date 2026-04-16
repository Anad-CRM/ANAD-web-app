import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { getUser } from "@/core/utils/auth";
import { PipelineData } from "../types";

export const getPipelineData = async (params?: Record<string, any>): Promise<PipelineData | null> => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId || params?.organizationId;

    const response = await api.request({
      url: API_ENDPOINTS.DASHBOARD.GET_LEAD_COUNTS,
      method: "GET",
      data: { ...params, organizationId: orgId }
    });
    return response.data?.data || null;
  } catch (error) {
    console.error("Failed to fetch pipeline data", error);
    return null;
  }
};
