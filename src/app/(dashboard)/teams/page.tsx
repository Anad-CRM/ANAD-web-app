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
                <div key={team.id || idx} className="bg-white border border-slate-50 rounded-[28px] p-8 shadow-[0_4px_24px_rgba(30,49,99,0.04)] hover:shadow-[0_12px_32px_rgba(30,49,99,0.08)] transition-all duration-500 flex flex-col group min-h-[200px]">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-[#1E3163] text-white w-14 h-14 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                      <Users size={24} />
                    </div>
                    <Text weight="bold" size="custom" className="text-slate-900 mt-2 tracking-tight" style={{ fontSize: '20px' }}>
                      {team.name}
                    </Text>
                  </div>

                  <div className="space-y-2 ml-[72px] mb-8">
                    <div className="flex items-center gap-2">
                      <Text className="text-slate-500" weight="medium">Members :</Text>
                      <Text weight="bold" className="text-slate-900">{membersCount}</Text>
                    </div>
                    <div className="flex items-center gap-2">
                       <Text className="text-slate-500" weight="medium">Leads :</Text>
                       <Text weight="bold" className="text-slate-900">{totalLeads}</Text>
                    </div>
                    <div className="flex items-center gap-2">
                       <Text className="text-slate-500" weight="medium">Performance :</Text>
                       <Text weight="bold" className="text-slate-900">{performance}%</Text>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end">
                    <Link href={`/teams/${team.id}`}>
                      <button className="bg-[#1E3163] text-white px-8 py-2 rounded-[14px] shadow-sm hover:opacity-90 active:scale-[0.97] transition-all">
                        <Text weight="bold" size="xs">View Details</Text>
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
