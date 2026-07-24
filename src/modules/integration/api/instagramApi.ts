import { api } from '@/core/api/axios';
import { getUser } from '@/core/utils/auth';

export interface InstagramConnectPayload {
  pageId: string;
  igUserId: string;
  igUsername?: string;
  pageAccessToken: string;
}

/**
 * Fetch all connected Instagram integrations for the current org.
 */
export const getConnectedInstagramAccounts = async () => {
  return api.get('/instagram/config');
};

/**
 * Connect an Instagram integration (Page + IG Business Account).
 */
export const connectInstagramIntegration = async (data: InstagramConnectPayload) => {
  const user = getUser<{ id?: string; organizationId?: string }>();
  if (!user?.organizationId) throw new Error('Authentication context missing');
  return api.post('/instagram/connect', { ...data, organizationId: user.organizationId, userId: user.id });
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
