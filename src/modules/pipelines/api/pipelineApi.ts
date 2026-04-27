import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { getUser } from "@/core/utils/auth";
import { PipelineData } from "../types";

export const getPipelineData = async (): Promise<PipelineData | null> => {
  try {
    const user = getUser<any>();
    const organizationId = user?.organizationId;
    if (!organizationId) return null;

    
    const response = await api.post(API_ENDPOINTS.DASHBOARD.GET_FILTERED_LEAD_COUNT, {
      organizationId,
      filter: "Overall",
    });

    if (response.data?.status === "success") {
      const lc = response.data.data?.leadCounts;
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
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch pipeline data", error);
    return null;
  }
};
