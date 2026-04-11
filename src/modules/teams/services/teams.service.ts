import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { TeamsResponse } from "../types/teams.types";

export const TeamsService = {
  async getAllTeams(payload: { organizationId: string; managerId?: string }): Promise<TeamsResponse> {
    const response = await api.post<TeamsResponse>(
      API_ENDPOINTS.TEAM.GET_ALL,
      payload
    );
    return response.data;
  },
};
