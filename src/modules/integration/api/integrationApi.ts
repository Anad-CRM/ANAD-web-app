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
