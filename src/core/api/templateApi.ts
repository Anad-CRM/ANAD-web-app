import { api } from "./axios";

export interface TemplateMessage {
  id: string;
  title: string;
  message: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  ruleType?: 'keyword' | 'scheduled';
  channel?: 'all' | 'whatsapp' | 'instagram';
  delayHours?: number;
  delayMinutes?: number;
  delaySeconds?: number;
  mediaUrl?: string | null;
  mediaType?: 'text' | 'image' | 'video' | 'audio' | 'document';
  targetAudience?: 'everyone' | 'selected';
  excludeChatIds?: string[];
  includeChatIds?: string[];
  lastTriggeredAt?: string | null;
  maxExecutionCount?: number;
}

export interface CreateTemplatePayload {
  title: string;
  message: string;
  isActive?: boolean;
  ruleType?: 'keyword' | 'scheduled';
  channel?: 'all' | 'whatsapp' | 'instagram';
  delayHours?: number;
  delayMinutes?: number;
  delaySeconds?: number;
  mediaUrl?: string | null;
  mediaType?: 'text' | 'image' | 'video' | 'audio' | 'document';
  targetAudience?: 'everyone' | 'selected';
  excludeChatIds?: string[];
  includeChatIds?: string[];
  maxExecutionCount?: number;
}

export async function getTemplateMessages(): Promise<TemplateMessage[]> {
  const res = await api.get("/whatsapp/getTemplateMessage");
  return res.data?.data ?? [];
}

export async function createTemplateMessage(payload: CreateTemplatePayload | string, message?: string): Promise<TemplateMessage> {
  const body = typeof payload === "string" ? { title: payload, message: message || "" } : payload;
  const res = await api.post("/whatsapp/createMessageTemplate", body);
  return res.data?.data;
}

export async function updateTemplateMessage(
  id: string,
  titleOrPayload: string | Partial<CreateTemplatePayload>,
  message?: string,
  isActive?: boolean
): Promise<TemplateMessage> {
  const body = typeof titleOrPayload === "string" 
    ? { title: titleOrPayload, message, isActive } 
    : { ...titleOrPayload, isActive };
  const res = await api.put(`/whatsapp/updateTemplateMessage/${id}`, body);
  return res.data?.data;
}

export async function deleteTemplateMessage(id: string): Promise<void> {
  await api.delete(`/whatsapp/deleteTemplateMessage/${id}`);
}
