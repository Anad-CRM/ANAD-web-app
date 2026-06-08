import { api } from '@/core/api/axios';
import { API_ENDPOINTS } from '@/core/api/api';
import { getUser } from '@/core/utils/auth';

export interface WhatsAppIntegrationPayload {
  whatsappBusinessAccountId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName?: string;
  accessToken: string;
}

export const connectWhatsAppIntegration = async (data: WhatsAppIntegrationPayload) => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  const payload = {
    integrations: [
      {
        ...data,
        organizationId: user.organizationId,
        userId: user.id
      }
    ]
  };

  return api.post(API_ENDPOINTS.INTEGRATION.CREATE_WHATSAPP, payload);
};

/**
 * Handle Embedded Signup OAuth callback:
 * Sends the code returned by Meta's JS SDK to the backend
 * which exchanges it for a token and provisions the WABA.
 */
export const handleEmbeddedSignupCallback = async (code: string) => {
  return api.post(API_ENDPOINTS.INTEGRATION.WHATSAPP_EMBEDDED_CALLBACK, { code });
};

/**
 * Fetch all connected WhatsApp accounts for the current organization.
 */
export const getConnectedWhatsAppAccounts = async () => {
  return api.get(API_ENDPOINTS.INTEGRATION.WHATSAPP_ACCOUNTS);
};

/**
 * Disconnect a specific WhatsApp phone number.
 */
export const disconnectWhatsAppAccount = async (phoneNumberId: string) => {
  return api.delete(API_ENDPOINTS.INTEGRATION.WHATSAPP_DISCONNECT(phoneNumberId));
};


export const disconnectWhatsAppIntegration = async () => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  return api.post(API_ENDPOINTS.INTEGRATION.DELETE_WHATSAPP, {
    organizationId: user.organizationId,
  });
};

export const connectFacebookWebhook = async (pageId: string, pageAccessToken: string, userAccessToken: string) => {
  const user = getUser<{ id?: string; _id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  const userId = user.id || user._id;

  const payload = {
    pageId,
    pageAccessToken,
    userId,
    userAccessToken,
    organizationId: user.organizationId
  };

  return api.post(API_ENDPOINTS.INTEGRATION.CREATE_SUBSCRIPTION, payload);
};

export const disconnectFacebookWebhook = async () => {
  const user = getUser<{ id?: string; _id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  const userId = user.id || user._id;

  return api.post(API_ENDPOINTS.INTEGRATION.DELETE_SUBSCRIPTION, {
    organizationId: user.organizationId,
    userId
  });
};

export const connectGoogleAds = async (serverAuthCode: string) => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  return api.post(API_ENDPOINTS.INTEGRATION.CREATE_GOOGLE, {
    serverAuthCode,
    userId: user.id,
    organizationId: user.organizationId
  });
};

export const disconnectGoogleAds = async () => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  return api.post(API_ENDPOINTS.INTEGRATION.DELETE_GOOGLE, {
    userId: user.id,
    organizationId: user.organizationId
  });
};

export const generateSecretKey = async () => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  return api.post(API_ENDPOINTS.INTEGRATION.GENERATE_KEY, {
    organizationId: user.organizationId
  });
};

export const disconnectSecretKey = async (secretKey: string) => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  return api.post(API_ENDPOINTS.INTEGRATION.DISCONNECT_KEY, {
    organizationId: user.organizationId,
    secretKey
  });
};
