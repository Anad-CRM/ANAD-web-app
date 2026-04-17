import { api } from '@/core/api/axios';
import { API_ENDPOINTS } from '@/core/api/api';
import type { ExportPayload } from '../types/export.types';

export const downloadExport = async (payload: ExportPayload): Promise<Blob> => {
  const response = await api.post<Blob>(API_ENDPOINTS.EXPORT.DOWNLOAD, payload, {
    responseType: 'blob',
  });
  return response.data;
};

export const getStaffByRole = async (organizationId: string) => {
  const response = await api.post(API_ENDPOINTS.STAFF.GET_BY_ROLE, { organizationId });
  return response.data;
};

export const getAllAds = async (organizationId: string) => {
  const response = await api.get(API_ENDPOINTS.DASHBOARD.GET_ALL_ADS(organizationId));
  return response.data;
};
