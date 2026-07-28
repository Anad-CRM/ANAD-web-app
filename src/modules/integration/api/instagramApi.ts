import { api } from '@/core/api/axios';

export interface InstagramConnectPayload {
  pageId: string;
  igUserId: string;
  igUsername?: string;
  pageAccessToken: string;
}

export interface InstagramLookupResult {
  success: boolean;
  data?: {
    igUserId: string;
    igUsername: string | null;
    pageId: string;
    pageName: string;
  };
  error?: string;
  hint?: string;
}

/**
 * Fetch all connected Instagram integrations for the current org.
 */
export const getConnectedInstagramAccounts = async () => {
  return api.get('/instagram/config');
};

/**
 * Look up the Instagram Business Account for a given Facebook Page ID.
 * The backend uses META_SYSTEM_USER_TOKEN (never exposed to browser) to do the lookup.
 * This bypasses the need for instagram_basic permission in the browser FB login.
 */
export const lookupInstagramPage = async (pageId: string): Promise<InstagramLookupResult> => {
  const resp = await api.get(`/instagram/lookup-page/${pageId}`);
  return resp.data as InstagramLookupResult;
};

/**
 * Connect an Instagram integration (Page + IG Business Account).
 */
export const connectInstagramIntegration = async (data: InstagramConnectPayload) => {
  // organizationId and userId are derived server-side from the JWT token
  return api.post('/instagram/connect', data);
};

/**
 * Disconnect an Instagram integration by pageId.
 */
export const disconnectInstagramAccount = async (pageId: string) => {
  return api.delete(`/instagram/disconnect/${pageId}`);
};

/**
 * Get all Instagram conversations for the current org.
 */
export const getInstagramConversations = async () => {
  return api.get('/instagram/conversations');
};

/**
 * Get messages for a specific Instagram DM thread.
 */
export const getInstagramMessages = async (igSenderId: string, limit = 50) => {
  return api.get(`/instagram/messages/${encodeURIComponent(igSenderId)}`, { params: { limit } });
};

/**
 * Send an Instagram DM reply.
 */
export const sendInstagramMessage = async (igSenderId: string, text: string, pageId?: string) => {
  return api.post('/instagram/send', { igSenderId, text, pageId });
};
