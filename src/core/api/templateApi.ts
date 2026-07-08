import { api } from "./axios";

export interface TemplateMessage {
  id: string;
  title: string;
  message: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
}

export async function getTemplateMessages(): Promise<TemplateMessage[]> {
  const res = await api.get("/whatsapp/getTemplateMessage");
  return res.data?.data ?? [];
}

export async function createTemplateMessage(title: string, message: string): Promise<TemplateMessage> {
  const res = await api.post("/whatsapp/createMessageTemplate", { title, message });
  return res.data?.data;
}

export async function updateTemplateMessage(id: string, title: string, message: string, isActive?: boolean): Promise<TemplateMessage> {
  const res = await api.put(`/whatsapp/updateTemplateMessage/${id}`, { title, message, isActive });
  return res.data?.data;
}

export async function deleteTemplateMessage(id: string): Promise<void> {
  await api.delete(`/whatsapp/deleteTemplateMessage/${id}`);
}
