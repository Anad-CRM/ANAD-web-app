import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";

export interface SendInvitationPayload {
  senderName: string;
  senderAvatar: string;
  organizationId: string;
  receiverEmail: string;
  role: string;
  teamId?: string | null;
  skillLevel?: string;
  batchName?: string;
}

export interface InviteResponse {
  status?: string;
  errors?: string[];
  error?: string;
  [key: string]: unknown;
}

export const InviteService = {
  async sendInvitation(payload: SendInvitationPayload): Promise<InviteResponse> {
    const response = await api.post(
      API_ENDPOINTS.INVITATION.SEND,
      payload
    );
    return response.data;
  }
};
