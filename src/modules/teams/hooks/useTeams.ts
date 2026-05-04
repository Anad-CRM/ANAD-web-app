import { useState, useEffect, useCallback } from "react";
import { TeamsService } from "../services/teams.service";
import { Team } from "../types/teams.types";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";

export function useTeams() {
  const { user } = useAuthContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!user || (!user.organizationId && !user.organization?.id)) return;

    try {
      setIsLoading(true);
      setError(null);
      const orgId = user.organizationId || user.organization?.id || "";

      const userRole = user.role?.toLowerCase() || "";
      
      const payload: any = { organizationId: orgId };
      if (userRole === "manager") {
         payload.managerId = user.id;
      }

      const response = await TeamsService.getAllTeams(payload);
      if (response.status === "success") {
        const fetchedTeams = response.data || [];
        
        const teamsWithStats = await Promise.all(
          fetchedTeams.map(async (team) => {
            try {
              const statsPayload = { teamId: team.id, organizationId: orgId };
              const statsResp = await TeamsService.getTeamLeadCounts(statsPayload);
              if (statsResp.status === "success" && statsResp.data) {
                const totalLeads = statsResp.data.totalLeads || 0;
                const positiveLeads = (statsResp.data.statusCounts?.closed || 0) + (statsResp.data.statusCounts?.contacted || 0);
                return { ...team, totalLeads, positiveLeads };
              }
            } catch (err) {
              console.error(`Failed to fetch stats for team ${team.id}`, err);
            }
            
            const totalLeads = team.users?.reduce((acc, user) => acc + (user.leadCounts?.totalLeads || 0), 0) || 0;
            const positiveLeads = team.users?.reduce((acc, user) => acc + (user.leadCounts?.closedCount || 0) + (user.leadCounts?.contactedCount || 0), 0) || 0;
            return { ...team, totalLeads, positiveLeads };
          })
        );
        
        setTeams(teamsWithStats);
      } else {
        setError("Failed to fetch teams");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const totalTeams = teams.length;
  const activeTeams = teams.filter((t) => t.status === "active").length;
  const totalMembers = teams.reduce((acc, team) => acc + (team.users?.length || 0), 0);

  return {
    teams,
    isLoading,
    error,
    stats: {
      totalTeams,
      activeTeams,
      totalMembers,
    },
    refetch: fetchTeams,
  };
}
