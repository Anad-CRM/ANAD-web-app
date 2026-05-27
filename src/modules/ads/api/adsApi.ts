import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { AdCampaign, AdWiseStatusResponse } from "../types";
import { getUser } from "@/core/utils/auth";

interface AuthUser {
  id?: string;
  organizationId?: string;
  role?: string;
}

export interface AdsPageResult {
  data: AdCampaign[];
  hasMore: boolean;
}

export const getAllAds = async (params?: Record<string, unknown>): Promise<AdCampaign[]> => {
  try {
    const user = getUser<AuthUser>();

    const orgId = user?.organizationId || params?.organizationId;

    if (!orgId) return [];

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_ALL_ADS(orgId as string));
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    return [];
  }
};

export const getAllAdsPage = async (
  params?: Record<string, unknown>
): Promise<AdsPageResult> => {
  try {
    const user = getUser<AuthUser>();
    const orgId = user?.organizationId || params?.organizationId;
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 12);

    if (!orgId) return { data: [], hasMore: false };

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_ALL_ADS(orgId as string), {
      params: { page, limit },
    });

    const payload = response.data;
    const ads = Array.isArray(payload?.data) ? payload.data : [];
    const hasMore = Boolean(payload?.meta?.hasMore);

    return { data: ads, hasMore };
  } catch (error) {
    console.error("Failed to fetch paginated ads:", error);
    return { data: [], hasMore: false };
  }
};

export const getAdStatusBreakdown = async (
  adId: string,
  params?: Record<string, unknown> & { adRecordId?: number }
): Promise<AdWiseStatusResponse | null> => {
  try {
    const user = getUser<AuthUser>();

    const orgId = user?.organizationId || params?.organizationId;

    if (!orgId) return null;

    const response = await api.post(API_ENDPOINTS.DASHBOARD.GET_AD_STATUS_COUNT(orgId as string), {
      adId,
      id: params?.adRecordId,
    });
    return response.data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch status breakdown for ad ${adId}:`, error);
    return null;
  }
};

export const getLiveAds = async (params?: Record<string, unknown>): Promise<AdCampaign[]> => {
  try {
    const user = getUser<AuthUser>();
    const orgId = user?.organizationId || params?.organizationId;

    if (!orgId) return [];

    const response = await api.get(API_ENDPOINTS.AUTO_LEAD.GET_LIVE_ADS(orgId as string));
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch live ads:", error);
    return [];
  }
};

export const getAdWithMostLeads = async (params?: Record<string, unknown>): Promise<AdCampaign | null> => {
  try {
    const user = getUser<AuthUser>();

    const orgId = user?.organizationId || params?.organizationId;

    if (!orgId) return null;

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_AD_WITH_MOST_LEADS, {
      params: { organizationId: orgId }
    });
    return response.data?.data || null;
  } catch (error) {
    console.error("Failed to fetch top ad:", error);
    return null;
  }
};

export const getAdById = async (adId: string): Promise<AdCampaign | null> => {
  try {
    const response = await api.post(API_ENDPOINTS.DASHBOARD.GET_AD_BY_ID, { adId });
    return response.data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch ad by id ${adId}:`, error);
    return null;
  }
};
