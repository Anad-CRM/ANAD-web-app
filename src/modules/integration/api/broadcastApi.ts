import { api } from '@/core/api/axios';
import { API_ENDPOINTS } from '@/core/api/api';

export interface BroadcastTemplate {
  id: string;
  name: string;
  status: string;
  language: string;
  category: string;
  components: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: string;
  text?: string;
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: string;
  text: string;
  url?: string;
  phone_number?: string;
}

export interface CreateBroadcastPayload {
  campaignName: string;
  phoneNumberId?: string;
  templateName: string;
  templateLanguage: string;
  templateParams?: TemplateParamComponent[];
  leadIds?: string[];
  filterByStatus?: string;
}

export interface TemplateParamComponent {
  type: 'header' | 'body' | 'button';
  parameters: TemplateParam[];
  sub_type?: string;
  index?: number;
}

export interface TemplateParam {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename: string };
}

export interface BroadcastRecord {
  id: string;
  campaignName: string;
  phoneNumberId: string;
  templateName: string;
  templateLanguage: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

/**
 * Fetch approved WhatsApp message templates from Meta via backend.
 */
export const fetchApprovedTemplates = async (): Promise<BroadcastTemplate[]> => {
  const resp = await api.get(API_ENDPOINTS.WHATSAPP.TEMPLATES);
  return resp.data?.data || [];
};

/**
 * Create a new broadcast campaign (returns broadcastId).
 */
export const createBroadcast = async (payload: CreateBroadcastPayload) => {
  return api.post(API_ENDPOINTS.WHATSAPP.BROADCAST_CREATE, payload);
};

/**
 * Start sending a broadcast campaign by its ID.
 * Backend processes asynchronously; this returns immediately.
 */
export const sendBroadcast = async (broadcastId: string) => {
  return api.post(API_ENDPOINTS.WHATSAPP.BROADCAST_SEND(broadcastId), {});
};

/**
 * Fetch broadcast campaign history for the organization.
 */
export const getBroadcastHistory = async (page = 1, limit = 20): Promise<{
  broadcasts: BroadcastRecord[];
  pagination: { currentPage: number; totalPages: number; totalItems: number };
}> => {
  const resp = await api.get(API_ENDPOINTS.WHATSAPP.BROADCAST_HISTORY, {
    params: { page, limit },
  });
  return resp.data?.data;
};

/**
 * Fetch recipients for a specific broadcast.
 */
export const getBroadcastRecipients = async (broadcastId: string, status?: string) => {
  const resp = await api.get(API_ENDPOINTS.WHATSAPP.BROADCAST_RECIPIENTS(broadcastId), {
    params: status ? { status } : {},
  });
  return resp.data?.data || [];
};
