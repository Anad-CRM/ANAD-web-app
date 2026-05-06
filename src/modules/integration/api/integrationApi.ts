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

export const disconnectWhatsAppIntegration = async () => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  return api.post(API_ENDPOINTS.INTEGRATION.DELETE_WHATSAPP, {
    organizationId: user.organizationId,
  });
};

export const connectFacebookWebhook = async (pageId: string, pageToken: string) => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  const payload = {
    webhookSubscriptions: [
      {
        pageId,
        pageToken,
        organizationId: user.organizationId
      }
    ]
  };

  return api.post(API_ENDPOINTS.INTEGRATION.CREATE_SUBSCRIPTION, payload);
};

export const disconnectFacebookWebhook = async () => {
  const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
  if (!user || !user.organizationId) {
     throw new Error("Authentication context missing");
  }

  return api.post(API_ENDPOINTS.INTEGRATION.DELETE_SUBSCRIPTION, {
    organizationId: user.organizationId,
    userId: user.id
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
