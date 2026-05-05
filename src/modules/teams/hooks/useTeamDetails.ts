/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { TeamsService } from "../services/teams.service";
import { Team, TeamLeadStatusCounts } from "../types/teams.types";

export function useTeamDetails(teamId: string) {
  const { user } = useAuthContext();
  const [team, setTeam] = useState<Team | null>(null);
  const [leadCounts, setLeadCounts] = useState<TeamLeadStatusCounts | null>(null);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async (filters?: { filterByUser?: string[]; startDate?: string; endDate?: string }) => {
    if (!user || (!user.organizationId && !user.organization?.id) || !teamId) return;

    try {
      setIsLoading(true);
      setError(null);
      const orgId = user.organizationId || user.organization?.id || "";
      const userRole = user.role?.toLowerCase() || "";
      
      const payload: Record<string, unknown> = { organizationId: orgId };
      if (userRole === "manager") {
         payload.managerId = user.id;
      }

      const teamsResponse = await TeamsService.getAllTeams(payload as { organizationId: string; managerId?: string });
      if (teamsResponse.status === "success") {
        const foundTeam = teamsResponse.data?.find((t) => t.id === teamId) || null;
        setTeam(foundTeam);
      } else {
        throw new Error("Failed to fetch team details");
      }

      const countsPayload = {
        teamId,
        organizationId: orgId,
        ...filters,
      };
      
      const countsResponse = await TeamsService.getTeamLeadCounts(countsPayload);
      if (countsResponse.status === "success") {
        setLeadCounts(countsResponse.data.statusCounts);
        setTotalLeads(countsResponse.data.totalLeads);
      }

    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [user, teamId]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  return {
    team,
    leadCounts,
    totalLeads,
    isLoading,
    error,
    refetch: fetchTeamData,
  };
}
