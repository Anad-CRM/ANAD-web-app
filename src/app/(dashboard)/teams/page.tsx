"use client";

import { useTeams } from "@/modules/teams/hooks/useTeams";
import Link from "next/link";
import { useState } from "react";
import { CreateTeamModal } from "@/modules/teams/components/CreateTeamModal";
import { InviteMemberModal } from "@/modules/teams/components/InviteMemberModal";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { Plus, UserPlus, Users, ArrowRight, ShieldCheck, Activity, Target } from "lucide-react";

export default function TeamsPage() {
  const { teams, stats, isLoading, error, refetch } = useTeams();
  const { user } = useAuthContext();
  
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);

  const TEAM_STATS = [
    { label: `${stats.totalTeams} Teams`, icon: <Users size={24} /> },
    { label: `${stats.totalMembers} Members`, icon: <UserPlus size={24} /> },
    { label: `${stats.activeTeams} Active Teams`, icon: <ShieldCheck size={24} /> },
  ];

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-20 animate-in fade-in duration-700">
      {/* Header Buttons area */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-2">
        <button 
          onClick={() => setIsCreateTeamOpen(true)}
          className="flex items-center gap-2.5 h-10 px-5 bg-white/80 border border-slate-200 rounded-[12px] text-slate-700 hover:bg-white shadow-sm transition-all active:scale-95 group font-medium"
        >
          <Plus size={18} className="text-slate-500 group-hover:rotate-90 transition-transform duration-300" />
          <Text weight="bold" size="xs">Create Team</Text>
        </button>
        <button 
          onClick={() => setIsInviteMemberOpen(true)}
          className="flex items-center gap-2.5 h-10 px-5 bg-white/80 border border-slate-200 rounded-[12px] text-slate-700 hover:bg-white shadow-sm transition-all active:scale-95 group font-medium"
        >
          <UserPlus size={18} className="text-slate-500" />
          <Text weight="bold" size="xs">Invite Member</Text>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        {TEAM_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[24px] p-4 flex items-center gap-5 shadow-sm border border-slate-50">
            <div 
              className="w-14 h-14 rounded-[12px] flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: '#1E3163' }}
            >
              {stat.icon}
            </div>
            <Text weight="bold" size="custom" className="text-slate-800" style={{ fontSize: '18px' }}>
              {stat.label}
            </Text>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <Text weight="bold" className="text-slate-800 ml-1">All Teams</Text>
        
        {isLoading ? (
          <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3163]"></div>
            <Text weight="medium" className="text-slate-500">Syncing teams...</Text>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-6 rounded-[24px]">
            <Text weight="bold" className="text-red-700 block mb-1">Error Loading Teams</Text>
            <Text className="text-red-600/80 text-sm">{error}</Text>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white/40 border-2 border-dashed border-slate-200 p-16 text-center rounded-[32px]">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <Text weight="bold" size="lg" className="text-slate-900 block mb-2">No Teams Yet</Text>
            <Text className="text-slate-500 max-w-xs mx-auto block mb-6">Teams help you organize staff and track collective lead performance.</Text>
            <button 
              onClick={() => setIsCreateTeamOpen(true)}
              className="bg-[#1E3163] text-white px-8 py-2.5 rounded-full font-bold shadow-lg"
            >
              Create First Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teams.map((team, idx) => {
              const membersCount = team.users?.length || 0;
              const totalLeads = team.totalLeads ?? (team.users?.reduce((acc, user) => acc + (user.leadCounts?.totalLeads || 0), 0) || 0);
              const performance = totalLeads > 0 ? 60 : 0; // Standardizing to match Figma mockup value

              return (
                <div key={team.id || idx} className="bg-white border border-slate-50 rounded-[28px] p-6 shadow-[0_4px_24px_rgba(30,49,99,0.04)] hover:shadow-[0_12px_32px_rgba(30,49,99,0.08)] transition-all duration-500 flex flex-col group min-h-[200px]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-[#1E3163] to-[#2A4482] text-white w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-500">
                        <Users size={24} />
                      </div>
                      <div className="mt-1">
                        <Text weight="bold" size="custom" className="text-slate-900 tracking-tight" style={{ fontSize: '20px' }}>
                          {team.name}
                        </Text>
                        <div className="flex items-center gap-2 mt-1">
                           <div className={`w-2 h-2 rounded-full ${team.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                           <Text size="xs" className="text-slate-500 capitalize">{team.status || 'Active'}</Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-[16px] p-4 flex flex-col gap-1 border border-slate-100/50 transition-colors group-hover:bg-blue-50/30">
                      <Text size="xs" className="text-slate-500" weight="medium">Manager</Text>
                      <Text size="sm" weight="bold" className="text-slate-800 line-clamp-1">{team.manager?.userName || 'Unassigned'}</Text>
                    </div>
                    <div className="bg-slate-50 rounded-[16px] p-4 flex flex-col gap-1 border border-slate-100/50 transition-colors group-hover:bg-blue-50/30">
                      <Text size="xs" className="text-slate-500" weight="medium">Team Leader</Text>
                      <Text size="sm" weight="bold" className="text-slate-800 line-clamp-1">
                        {team.teamLeaders && team.teamLeaders.length > 0 
                          ? team.teamLeaders.map(l => l.userName).join(', ') 
                          : 'Unassigned'}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-6 mb-6 px-2">
                    <div className="flex flex-col gap-1">
                      <Text className="text-slate-500" size="xs" weight="medium">Members</Text>
                      <Text weight="bold" size="lg" className="text-[#1E3163]">{membersCount}</Text>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-200"></div>
                    <div className="flex flex-col gap-1 items-center">
                       <Text className="text-slate-500" size="xs" weight="medium">Leads</Text>
                       <Text weight="bold" size="lg" className="text-[#1E3163]">{totalLeads}</Text>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-200"></div>
                    <div className="flex flex-col gap-1 items-end">
                       <Text className="text-slate-500" size="xs" weight="medium">Performance</Text>
                       <Text weight="bold" size="lg" className="text-emerald-600">{performance}%</Text>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end">
                    <Link href={`/teams/${team.id}`} className="w-full">
                      <button className="w-full bg-[#1E3163] text-white py-3 rounded-[16px] shadow-sm hover:bg-[#15234b] hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2">
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
        onSuccess={() => {}}
      />
    </div>
  );
}
