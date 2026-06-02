/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTeams } from "@/modules/teams/hooks/useTeams";
import Link from "next/link";
import { useState } from "react";
import { CreateTeamModal } from "@/modules/teams/components/CreateTeamModal";
import { InviteMemberModal } from "@/modules/teams/components/InviteMemberModal";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { Plus, UserPlus, Users, ArrowRight, ShieldCheck, MoreVertical } from "lucide-react";
import { EditTeamModal } from "@/modules/teams/components/EditTeamModal";
import { ConfirmDialog } from "@/core/components/ui/ConfirmDialog";
import { useFeedback } from "@/core/contexts/FeedbackContext";
import { TeamsService } from "@/modules/teams/services/teams.service";
import { useEffect } from "react";

export default function TeamsPage() {
  const { teams, stats, isLoading, error, refetch } = useTeams();
  const { user } = useAuthContext();
  const { showToast } = useFeedback();
  
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const isAdminOrManager = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "superadmin" || user?.role?.toLowerCase() === "manager";

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.('.team-actions-dropdown')) return;
      setOpenMenuId(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleAction = (e: React.MouseEvent, action: string, team: any) => {
    e.stopPropagation();
    setOpenMenuId(null);

    const teamId = team.id || team._id;

    if (action === "Edit") {
      setEditingTeam(team);
    } else if (action === "Activate") {
      setConfirm({
        title: "Activate Team",
        message: "Are you sure you want to activate this team?",
        onConfirm: async () => {
          setConfirm(null);
          try {
            await TeamsService.activateTeam({ teamId });
            showToast("Team activated successfully", "success");
            refetch?.();
          } catch (e) {
            console.error(e);
            showToast("Failed to activate team", "error");
          }
        },
      });
    } else if (action === "Deactivate") {
      setConfirm({
        title: "Deactivate Team",
        message: "Are you sure you want to deactivate this team?",
        onConfirm: async () => {
          setConfirm(null);
          try {
            await TeamsService.deactivateTeam({ teamId });
            showToast("Team deactivated successfully", "success");
            refetch?.();
          } catch (e) {
            console.error(e);
            showToast("Failed to deactivate team", "error");
          }
        },
      });
    } else if (action === "Delete") {
      setConfirm({
        title: "Delete Team",
        message: "Are you sure you want to delete this team?",
        onConfirm: async () => {
          setConfirm(null);
          try {
            await TeamsService.deleteTeam({ teamId });
            showToast("Team deleted successfully", "success");
            refetch?.();
          } catch (e) {
            console.error(e);
            showToast("Failed to delete team", "error");
          }
        },
      });
    }
  };

  const TEAM_STATS = [
    { label: `${stats.totalTeams} Teams`, icon: <Users size={24} /> },
    { label: `${stats.totalMembers} Members`, icon: <UserPlus size={24} /> },
    { label: `${stats.activeTeams} Active Teams`, icon: <ShieldCheck size={24} /> },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-6 min-h-screen pb-20 animate-in fade-in duration-700">
      {/* Header Buttons area */}
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 mb-2 w-full">
        <button
          onClick={() => setIsCreateTeamOpen(true)}
          className="flex items-center justify-center sm:justify-start gap-2.5 h-10 w-full sm:w-auto px-5 bg-white/80 rounded-[12px] hover:bg-white shadow-sm transition-all active:scale-95 group font-medium"
          style={{ border: `1px solid ${COLORS.border}` }}
        >
          <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" style={{ color: COLORS.subtle }} />
          <Text weight="bold" size="xs">Create Team</Text>
        </button>
        <button
          onClick={() => setIsInviteMemberOpen(true)}
          className="flex items-center justify-center sm:justify-start gap-2.5 h-10 w-full sm:w-auto px-5 bg-white/80 rounded-[12px] hover:bg-white shadow-sm transition-all active:scale-95 group font-medium"
          style={{ border: `1px solid ${COLORS.border}` }}
        >
          <UserPlus size={18} style={{ color: COLORS.subtle }} />
          <Text weight="bold" size="xs">Invite Member</Text>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-6">
        {TEAM_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[24px] p-4 flex items-center gap-5 shadow-sm" style={{ border: `1px solid ${COLORS.primaryXlight}` }}>
            <div
              className="w-14 h-14 rounded-[12px] flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: COLORS.primaryDark }}
            >
              {stat.icon}
            </div>
            <Text weight="bold" size="custom" className="text-slate-800" style={{ fontSize: '18px', color: COLORS.text }}>
              {stat.label}
            </Text>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <Text weight="bold" className="ml-1" style={{ color: COLORS.text }}>All Teams</Text>

        {isLoading ? (
          <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: COLORS.primaryDark }}></div>
            <Text weight="medium" style={{ color: COLORS.muted }}>Syncing teams...</Text>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-6 rounded-[24px]">
            <Text weight="bold" className="block mb-1" style={{ color: COLORS.danger }}>Error Loading Teams</Text>
            <Text className="text-sm" style={{ color: COLORS.danger }}>{error}</Text>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white/40 border-2 border-dashed border-slate-200 p-16 text-center rounded-[32px]">
            <Users size={48} className="mx-auto mb-4" style={{ color: COLORS.subtle }} />
            <Text weight="bold" size="lg" className="block mb-2" style={{ color: COLORS.text }}>No Teams Yet</Text>
            <Text className="max-w-xs mx-auto block mb-6" style={{ color: COLORS.muted }}>Teams help you organize staff and track collective lead performance.</Text>
            <button
              onClick={() => setIsCreateTeamOpen(true)}
              className="px-8 py-2.5 rounded-full font-bold shadow-lg text-white"
              style={{ backgroundColor: COLORS.primaryDark }}
            >
              Create First Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {teams.map((team, idx) => {
              const membersCount = team.users?.length || 0;
              const totalLeads = team.totalLeads ?? (team.users?.reduce((acc, user) => acc + (user.leadCounts?.totalLeads || 0), 0) || 0);
              const closedLeads = team.users?.reduce((acc, user) => acc + (user.leadCounts?.closedCount || 0), 0) || 0;
              const registeredLeads = team.users?.reduce((acc, user) => acc + (user.leadCounts?.registerCount || user.leadCounts?.registered || 0), 0) || 0;
              console.log("registered leads-----", registeredLeads);

              const performance = totalLeads > 0 ? Math.round(((closedLeads + registeredLeads) / totalLeads) * 100) : 0;
              return (
                <div key={team.id || idx} className="bg-white rounded-[28px] p-6 shadow-[0_4px_24px_rgba(30,49,99,0.04)] hover:shadow-[0_12px_32px_rgba(30,49,99,0.08)] transition-all duration-500 flex flex-col group min-h-[200px]" style={{ border: `1px solid ${COLORS.primaryXlight}` }}>
                  <div className="flex items-start justify-between mb-6 gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="text-white w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-500" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
                        <Users size={24} />
                      </div>
                      <div className="mt-1 min-w-0">
                        <Text weight="bold" size="custom" className="tracking-tight" style={{ fontSize: '20px', color: COLORS.text }}>
                          {team.name}
                        </Text>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${team.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <Text size="xs" className="capitalize" style={{ color: COLORS.muted }}>{team.status || 'Active'}</Text>
                        </div>
                      </div>
                    </div>
                    {isAdminOrManager && (
                      <div className="relative team-actions-dropdown">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            const currentMenuId = team.id || (team as any)._id || idx;
                            setOpenMenuId((prev) => prev === currentMenuId ? null : currentMenuId);
                          }}
                          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                        >
                          <MoreVertical size={20} className="pointer-events-none" />
                        </button>

                        {openMenuId === (team.id || (team as any)._id || idx) && (
                          <div className="absolute top-10 right-0 w-40 bg-white rounded-xl shadow-lg border py-2 z-[100]" style={{ borderColor: COLORS.primaryXlight }}>
                            <button onClick={(e) => handleAction(e, "Edit", team)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm font-medium text-slate-700">Edit</button>
                            {team.status === 'active' ? (
                              <button onClick={(e) => handleAction(e, "Deactivate", team)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm font-medium text-amber-600">Deactivate</button>
                            ) : (
                              <button onClick={(e) => handleAction(e, "Activate", team)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm font-medium text-emerald-600">Activate</button>
                            )}
                            <button onClick={(e) => handleAction(e, "Delete", team)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm font-medium text-red-600">Delete</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-[16px] p-4 flex flex-col gap-1 transition-colors group-hover:bg-blue-50/30" style={{ border: `1px solid ${COLORS.primaryXlight}` }}>
                      <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>Manager</Text>
                      <Text size="sm" weight="bold" className="line-clamp-1" style={{ color: COLORS.text }}>{team.manager?.userName || 'Unassigned'}</Text>
                    </div>
                    <div className="bg-slate-50 rounded-[16px] p-4 flex flex-col gap-1 transition-colors group-hover:bg-blue-50/30" style={{ border: `1px solid ${COLORS.primaryXlight}` }}>
                      <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>Team Leader</Text>
                      <Text size="sm" weight="bold" className="line-clamp-1" style={{ color: COLORS.text }}>
                        {team.teamLeaders && team.teamLeaders.length > 0
                          ? team.teamLeaders.map(l => l.userName).join(', ')
                          : 'Unassigned'}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-6 mb-6 px-2" style={{ borderColor: COLORS.primaryXlight }}>
                    <div className="flex flex-col gap-1">
                      <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>Members</Text>
                      <Text weight="bold" size="lg" style={{ color: COLORS.primaryDark }}>{membersCount}</Text>
                    </div>
                    <div className="w-[1px] h-8" style={{ backgroundColor: COLORS.border }}></div>
                    <div className="flex flex-col gap-1 items-center">
                      <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>Leads</Text>
                      <Text weight="bold" size="lg" style={{ color: COLORS.primaryDark }}>{totalLeads}</Text>
                    </div>
                    <div className="w-[1px] h-8" style={{ backgroundColor: COLORS.border }}></div>
                    <div className="flex flex-col gap-1 items-end">
                      <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>Performance</Text>
                      <Text weight="bold" size="lg" className="text-emerald-600">{performance}%</Text>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end">
                    <Link href={`/teams/${team.id}`} className="w-full">
                      <button className="w-full text-white py-3 rounded-[16px] shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2" style={{ backgroundColor: COLORS.primaryDark }}>
                        <Text weight="bold" size="sm">View Details</Text>
                        <ArrowRight size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        organizationId={user?.organizationId || user?.organization?.id || ""}
        onSuccess={() => refetch?.()}
      />

      <InviteMemberModal
        isOpen={isInviteMemberOpen}
        onClose={() => setIsInviteMemberOpen(false)}
        organizationId={user?.organizationId || user?.organization?.id || ""}
        senderName={user?.userName || ""}
        senderAvatar={user?.avatar || ""}
        teams={teams}
        onSuccess={() => { }}
      />

      <EditTeamModal
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        organizationId={user?.organizationId || user?.organization?.id || ""}
        onSuccess={() => refetch?.()}
        team={editingTeam}
      />

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
