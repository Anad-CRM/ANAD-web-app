import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { FollowUp, FollowUpSummary } from "../types";

interface GetFollowUpsParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  staffId?: string | number;
  date?: string;
  fromDate?: string;
  toDate?: string;
}

export const getFollowUps = async (
  params: GetFollowUpsParams
): Promise<{ data: FollowUp[]; meta: Record<string, unknown> }> => {
  const response = await api.request({
    url: API_ENDPOINTS.FOLLOW_UP.GET_ALL,
    method: "GET",
    data: params,
  });
  return response.data;
};

export const createFollowup = async (payload: { leadId: string; userId: string; notes: string; date: string; type: string }) => {
  const response = await api.post("/followup/createFollowup", payload);
  return response.data;
};

export const getFollowUpSummary = async (
  params?: GetFollowUpsParams
): Promise<{ data: FollowUpSummary }> => {
  const response = await api.request({
    url: API_ENDPOINTS.FOLLOW_UP.SUMMARY,
    method: "GET",
    data: params || {},
  });
  return response.data;
};

export const completeFollowUp = async (
  followupId: number,
  remarks?: string
) => {
  const response = await api.patch(API_ENDPOINTS.FOLLOW_UP.COMPLETE(followupId), {
    remarks,
  });
  return response.data;
};

export const rescheduleFollowUp = async (
  followupId: number,
  params: { date: string; notes?: string }
) => {
  const response = await api.patch(API_ENDPOINTS.FOLLOW_UP.RESCHEDULE(followupId), params);
  return response.data;
};
