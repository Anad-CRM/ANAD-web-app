import { useState, useEffect } from 'react';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { getStaffByRole, getAllAds } from '../api/exportApi';
import { TeamsService } from '@/modules/teams/services/teams.service';
import type { StaffMember, TeamOption, AdOption } from '../types/export.types';

interface ExportDataState {
  staff: StaffMember[];
  teams: TeamOption[];
  ads: AdOption[];
  isLoading: boolean;
}

const ROLE_ORDER: Record<string, number> = {
  'Manager': 0,
  'Team Leader': 1,
  'Staff Member': 2,
  'Students': 3,
};

export function useExportData(): ExportDataState {
  const { user } = useAuthContext();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [ads, setAds] = useState<AdOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.organizationId) return;

    const orgId = user.organizationId as string;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [staffRes, teamsRes, adsRes] = await Promise.allSettled([
          getStaffByRole(orgId),
          TeamsService.getAllTeams({ organizationId: orgId }),
          getAllAds(orgId),
        ]);

        if (staffRes.status === 'fulfilled') {
          const data = staffRes.value?.data || {};
          const combined: StaffMember[] = [
            ...(data.managers || []),
            ...(data.teamLeaders || []),
            ...(data.staffMembers || []),
            ...(data.students || []),
          ];

          combined.sort((a, b) => {
            const orderA = ROLE_ORDER[a.role] ?? 99;
            const orderB = ROLE_ORDER[b.role] ?? 99;
            if (orderA !== orderB) return orderA - orderB;
            return (a.userName || '').localeCompare(b.userName || '');
          });

          setStaff(combined);
        }

        if (teamsRes.status === 'fulfilled') {
          const raw = teamsRes.value?.data || teamsRes.value || [];
          const sortedTeams = [...raw]
            .map((t: { id: string; name: string }) => ({
              teamId: t.id,
              teamName: t.name,
            }))
            .sort((a, b) => a.teamName.localeCompare(b.teamName));
          setTeams(sortedTeams);
        }

        if (adsRes.status === 'fulfilled') {
          const rawAds = adsRes.value?.data || adsRes.value || [];
          const sortedAds = [...rawAds].sort((a, b) => (a.adName || '').localeCompare(b.adName || ''));
          setAds(sortedAds);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [user?.organizationId]);

  return { staff, teams, ads, isLoading };
}

