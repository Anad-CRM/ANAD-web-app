import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { getUser } from "@/core/utils/auth";
import { PipelineData } from "../types";

const NON_ADMIN_ROLES = ["Staff Member", "Team Leader", "Manager"];

export const getPipelineData = async (): Promise<PipelineData | null> => {
  try {
    const user = getUser<any>();
    const organizationId = user?.organization?.id || user?.organizationId;
    if (!organizationId) return null;

    const isNonAdmin = NON_ADMIN_ROLES.includes(user?.role);

    let lc: Record<string, number> | null = null;

    if (isNonAdmin) {
      
      const response = await api.post(API_ENDPOINTS.DASHBOARD.GET_LEAD_COUNTS, {
        organizationId,
        userId: user?.id ?? null,
      });
      if (response.data?.status === "success") {
        lc = response.data.data ?? null;
      }
    } else {
      const response = await api.post(API_ENDPOINTS.DASHBOARD.GET_FILTERED_LEAD_COUNT, {
        organizationId,
        filter: "Overall",
      });
      if (response.data?.status === "success") {
        lc = response.data.data?.leadCounts ?? null;
      }
    }

    if (!lc) return null;

    return {
      newLeadCount:        lc.newLeadCount        ?? 0,
      hotLeadCount:        lc.hotLeadCount        ?? 0,
      contactedLeadCount:  lc.contactedLeadCount  ?? 0,
      notInterestCount:    lc.notInterestCount     ?? 0,
      customerCount:       lc.customerCount        ?? 0,
      closedLeadCount:     lc.closedLeadCount      ?? 0,
      followUpCount:       lc.followUpCount        ?? 0,
      rnrCount:            lc.rnrCount             ?? 0,
      switchOffCount:      lc.switchOffCount       ?? 0,
      busyCount:           lc.busyCount            ?? 0,
      registerCount:       lc.registerCount        ?? 0,
      disqualifiedCount:   lc.disqualifiedCount    ?? 0,
    } as PipelineData;
  } catch (error) {
    console.error("Failed to fetch pipeline data", error);
    return null;
  }
};
