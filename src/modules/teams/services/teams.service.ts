import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { TeamsResponse, TeamLeadCountsResponse, TeamLeadCountPayload } from "../types/teams.types";

export const TeamsService = {
  async getAllTeams(payload: { organizationId: string; managerId?: string }): Promise<TeamsResponse> {
    const response = await api.post<TeamsResponse>(
      API_ENDPOINTS.TEAM.GET_ALL,
      payload
    );
    return response.data;
  },

  async getTeamLeadCounts(payload: TeamLeadCountPayload): Promise<TeamLeadCountsResponse> {
    const response = await api.post<TeamLeadCountsResponse>(
      API_ENDPOINTS.TEAM.GET_TEAM_LEAD_STATUS_COUNTS,
      payload
    );
    return response.data;
  },

  async createTeam(payload: { organizationId: string; name: string }): Promise<any> {
    const response = await api.post(
      API_ENDPOINTS.TEAM.CREATE,
      payload
    );
    return response.data;
  }
};
