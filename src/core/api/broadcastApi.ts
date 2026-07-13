import { api } from "./axios";


export type BroadcastStatus = "draft" | "running" | "completed" | "failed" | "cancelled";
export type RecipientStatus = "pending" | "sent" | "failed" | "skipped";

export interface Broadcast {
  id: string;
  campaignName: string;
  phoneNumberId: string;
  templateName: string;
  templateLanguage: string;
  templateParams: unknown[];
  status: BroadcastStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface BroadcastRecipient {
  id: string;
  broadcastId: string;
  leadId: string | null;
  phoneNumber: string;
  status: RecipientStatus;
  errorMessage: string | null;
  whatsappMessageId: string | null;
  sentAt: string | null;
  createdAt: string;
  lead?: { id: string; userName: string | null; mobileNumber: string | null };
}

export interface MetaTemplate {
  id: string;
  name: string;
  status: string;
  language: string;
  category: string;
  components: MetaTemplateComponent[];
}

export interface MetaTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: string;
  text?: string;
  buttons?: { type: string; text: string }[];
}

export interface CreateBroadcastPayload {
  campaignName: string;
  templateName: string;
  templateLanguage: string;
  templateParams?: unknown[];
  leadIds?: string[];
  filterByStatus?: string;
  phoneNumberId?: string;
}

// ─────────────────────────────────────────────────────────────
// API Calls
// ─────────────────────────────────────────────────────────────

/** Fetch approved Meta templates for the org's WhatsApp integration */
export async function getTemplates(): Promise<MetaTemplate[]> {
  const res = await api.get("/whatsapp/broadcast/templates");
  return res.data?.data ?? [];
}

/** Fetch all broadcast campaigns for the org (paginated, default page=1 limit=50) */
export async function getBroadcastHistory(page = 1, limit = 50): Promise<{
  broadcasts: Broadcast[];
  pagination: { currentPage: number; totalPages: number; totalItems: number };
}> {
  const res = await api.get("/whatsapp/broadcast/history", { params: { page, limit } });
  return res.data?.data ?? { broadcasts: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
}

/** Fetch single broadcast detail + recipients */
export async function getBroadcastRecipients(
  broadcastId: string,
  status?: RecipientStatus
): Promise<BroadcastRecipient[]> {
  const res = await api.get(`/whatsapp/broadcast/${broadcastId}/recipients`, {
    params: status ? { status } : {},
  });
  return res.data?.data ?? [];
}

/** Create a new broadcast campaign (status=draft) */
export async function createBroadcast(payload: CreateBroadcastPayload): Promise<{
  broadcastId: string;
  campaignName: string;
  totalRecipients: number;
  status: BroadcastStatus;
}> {
  const res = await api.post("/whatsapp/broadcast/create", payload);
  return res.data?.data;
}

/** Start sending a broadcast (sets status=running, processes async) */
export async function sendBroadcast(broadcastId: string): Promise<void> {
  await api.post(`/whatsapp/broadcast/send/${broadcastId}`);
}
