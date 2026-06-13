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

  async createTeam(payload: { organizationId: string; name: string; category?: string; typeCategory?: string; managerId?: string; iconIndex?: number }): Promise<unknown> {
    const response = await api.post(
      API_ENDPOINTS.TEAM.CREATE,
      payload
    );
    return response.data;
  },

  async updateTeam(teamId: string, payload: { name: string; category?: string; typeCategory?: string; managerId?: string; iconIndex?: number }): Promise<unknown> {
    const response = await api.post(
      `${API_ENDPOINTS.TEAM.UPDATE}/${teamId}`,
      payload
    );
    return response.data;
  },

  async activateTeam(payload: { teamId: string }): Promise<unknown> {
    const response = await api.post(
      API_ENDPOINTS.TEAM.ACTIVATE,
      payload
    );
    return response.data;
  },

  async deactivateTeam(payload: { teamId: string }): Promise<unknown> {
    const response = await api.post(
      API_ENDPOINTS.TEAM.DEACTIVATE,
      payload
    );
    return response.data;
  },

  async deleteTeam(payload: { teamId: string }): Promise<unknown> {
    const response = await api.post(
      API_ENDPOINTS.TEAM.DELETE,
      payload
    );
    return response.data;
  },

  async getStaffExcludeTeam(payload: { teamId: string; organizationId: string }): Promise<unknown> {
    const response = await api.post(
      API_ENDPOINTS.TEAM.GET_STAFF_EXCLUDE_TEAM,
      payload
    );
    return response.data;
  },

  async changeStaffTeam(payload: { userId: string[]; newTeamId: string }): Promise<unknown> {
    const response = await api.put(
      API_ENDPOINTS.TEAM.CHANGE_STAFF_TEAM,
      payload
    );
    return response.data;
  }
};
