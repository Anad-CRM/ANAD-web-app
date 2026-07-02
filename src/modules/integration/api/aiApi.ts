import { api } from '@/core/api/axios';
import { API_ENDPOINTS } from '@/core/api/api';
import { getUser } from '@/core/utils/auth';

export interface AiConfigPayload {
  provider: 'gemini' | 'openai' | 'none';
  apiKey: string;
  systemPrompt: string;
  isEnabled: boolean;
}

export interface AiConfigResponse {
  id?: string;
  provider: 'gemini' | 'openai' | 'none';
  apiKey: string;
  systemPrompt: string;
  isEnabled: boolean;
  isDefault?: boolean;
  hasApiKey?: boolean;
}

function getOrgId() {
  const user = getUser<{ organizationId?: string }>();
  return user?.organizationId;
}

/**
 * Fetch the AI configuration for the current organization.
 */
export const getAiConfig = async (): Promise<AiConfigResponse> => {
  const resp = await api.get(API_ENDPOINTS.AI.CONFIG);
  return resp.data?.data as AiConfigResponse;
};

/**
 * Save (create or update) the AI configuration.
 */
export const saveAiConfig = async (payload: AiConfigPayload): Promise<void> => {
  const organizationId = getOrgId();
  if (!organizationId) throw new Error('Authentication context missing');

  await api.post(API_ENDPOINTS.AI.CONFIG, {
    ...payload,
    organizationId,
  });
};

/**
 * Delete / disconnect the AI configuration for the current organization.
 */
export const deleteAiConfig = async (): Promise<void> => {
  const organizationId = getOrgId();
  if (!organizationId) throw new Error('Authentication context missing');

  await api.delete(API_ENDPOINTS.AI.CONFIG, {
    data: { organizationId },
  });
};

/**
 * Test the AI prompt with a sample message.
 * Can pass provider / apiKey / systemPrompt directly to test before saving.
 */
export const testAiPrompt = async (
  testMessage: string,
  overrides?: Partial<AiConfigPayload>
): Promise<string> => {
  const organizationId = getOrgId();

  const resp = await api.post(API_ENDPOINTS.AI.TEST_PROMPT, {
    testMessage,
    organizationId,
    ...(overrides?.provider ? { provider: overrides.provider } : {}),
    ...(overrides?.apiKey ? { apiKey: overrides.apiKey } : {}),
    ...(overrides?.systemPrompt !== undefined ? { systemPrompt: overrides.systemPrompt } : {}),
  });

  return resp.data?.data?.reply as string;
};
