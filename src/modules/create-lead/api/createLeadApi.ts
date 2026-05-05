import { api } from '@/core/api/axios';
import { API_ENDPOINTS } from '@/core/api/api';
import { getUser } from '@/core/utils/auth';

export interface CreateLeadPayload {
  userName: string;
  email?: string;
  mobileNumber: string;
  leadSource: string;
  adId?: string;
  staffId?: string;
}

export const createSingleLead = async (data: CreateLeadPayload) => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
    throw new Error('Authentication error: Missing organization details.');
  }

  const payload = {
    ...data,
    organizationId: user.organizationId,
    internal: true, 
  };

  return api.post(API_ENDPOINTS.CREATE_LEADS.SINGLE, payload);
};
