import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { AdCampaign, AdWiseStatusResponse } from "../types";
import { getUser } from "@/core/utils/auth";

export const getAllAds = async (params?: Record<string, any>): Promise<AdCampaign[]> => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId || params?.organizationId;

    if (!orgId) return [];

    const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_ALL_ADS(orgId));
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    return [];
  }
};

export const getAdStatusBreakdown = async (adId: string, params?: Record<string, any>): Promise<AdWiseStatusResponse | null> => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId || params?.organizationId;

    if (!orgId) return null;

    const response = await api.post(API_ENDPOINTS.DASHBOARD.GET_AD_STATUS_COUNT(orgId), {
      adId
    });
    return response.data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch status breakdown for ad ${adId}:`, error);
    return null;
  }
};

export const getLiveAds = async (params?: Record<string, any>): Promise<AdCampaign[]> => {
  try {
    const user = getUser<any>();
    const orgId = user?.organizationId || params?.organizationId;

    if (!orgId) return [];

    const response = await api.get(API_ENDPOINTS.AUTO_LEAD.GET_LIVE_ADS(orgId));
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch live ads:", error);
    return [];
  }
};

export const getAdWithMostLeads = async (params?: Record<string, any>): Promise<AdCampaign | null> => {
  try {
    const user = getUser<any>();
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
