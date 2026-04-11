import { api } from "@/core/api/axios";
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
): Promise<{ data: FollowUp[]; meta: any }> => {
  const response = await api.request({
    url: "/followup/getAllFollowUp",
    method: "GET",
    data: params,
  });
  return response.data;
};

export const getFollowUpSummary = async (
  params?: GetFollowUpsParams
): Promise<{ data: FollowUpSummary }> => {
  const response = await api.request({
    url: "/followup/summary",
    method: "GET",
    data: params || {},
  });
  return response.data;
};

export const completeFollowUp = async (
  followupId: number,
  remarks?: string
) => {
  const response = await api.patch(`/followup/complete/${followupId}`, {
    remarks,
  });
  return response.data;
};

export const rescheduleFollowUp = async (
  followupId: number,
  params: { date: string; notes?: string }
) => {
  const response = await api.patch(`/followup/reschedule/${followupId}`, params);
  return response.data;
};
