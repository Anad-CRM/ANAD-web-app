import { api } from '@/core/api/axios';
import { API_ENDPOINTS } from '@/core/api/api';
import { getUser } from '@/core/utils/auth';

export const fetchBusinesses = async (accessToken: string) => {
  const url = `https://graph.facebook.com/v18.0/me/businesses?access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch businesses');
  }
  return data.data || [];
};

export const fetchWABAs = async (businessId: string, accessToken: string) => {
  const url = `https://graph.facebook.com/v18.0/${businessId}/owned_whatsapp_business_accounts?fields=id,name,verified_name,account_review_status,message_template_namespace&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch WABAs');
  }
  return data.data || [];
};

export const fetchPhoneNumbers = async (wabaId: string, accessToken: string) => {
  const url = `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch phone numbers');
  }
  return data.data || [];
};

export const fetchAndCreateAllWhatsAppIntegrations = async (accessToken: string) => {
  const user = getUser<{ id?: string; organizationId?: string }>();
  if (!user || !user.organizationId) {
    throw new Error("Authentication context missing");
  }

  const businesses = await fetchBusinesses(accessToken);
  if (!businesses.length) {
    throw new Error("No businesses found for this token.");
  }

  const allIntegrations: any[] = [];

  const businessPromises = businesses.map(async (business: any) => {
    const wabas = await fetchWABAs(business.id, accessToken);
    
    const wabaPromises = wabas.map(async (waba: any) => {
      const numbers = await fetchPhoneNumbers(waba.id, accessToken);
      
      for (const number of numbers) {
        allIntegrations.push({
          phoneNumberId: number.id,
          whatsappBusinessAccountId: waba.id,
          displayPhoneNumber: number.display_phone_number,
          accessToken: accessToken,
          verifiedName: number.verified_name,
          userId: user.id,
          organizationId: user.organizationId
        });
      }
    });

    await Promise.all(wabaPromises);
  });

  await Promise.all(businessPromises);

  if (allIntegrations.length === 0) {
    throw new Error("No WhatsApp phone numbers found across your businesses.");
  }

  return api.post(API_ENDPOINTS.INTEGRATION.CREATE_WHATSAPP, {
    integrations: allIntegrations
  });
};
