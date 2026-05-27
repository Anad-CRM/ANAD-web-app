"use client";

import { useTeamDetails } from "@/modules/teams/hooks/useTeamDetails";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/core/components/ui/BackButton";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { Users, Filter, User, Target, TrendingUp, ChevronRight, UserPlus } from "lucide-react";
import { useState } from "react";
import { AddMemberModal } from "@/modules/teams/components/AddMemberModal";

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const { team, leadCounts, totalLeads, unAssignedCount, isLoading, error, refetch } = useTeamDetails(teamId);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const leadStatuses = [
    { name: "All Leads", count: totalLeads },
    { name: "Pending", count: unAssignedCount || 0 }, // Represents Unassigned leads
    { name: "New Lead", count: leadCounts?.newLead || 0 },
    { name: "Hot Lead", count: leadCounts?.hotLead || 0 },
    { name: "Contacted", count: leadCounts?.contacted || 0 },
    { name: "Follow Up", count: leadCounts?.followUp || 0 },
    { name: "RNR", count: leadCounts?.rnr || 0 },
    { name: "Busy", count: leadCounts?.busy || 0 },
    { name: "Switch Off", count: leadCounts?.switchedOff || 0 },
    { name: "Not Interested", count: leadCounts?.notInterested || 0 },
    { name: "Register", count: leadCounts?.registered || 0 },
    { name: "Customer", count: leadCounts?.customer || 0 },
    { name: "Disqualified", count: leadCounts?.disqualified || 0 },
    { name: "Closed", count: leadCounts?.closed || 0 },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: COLORS.primaryDark }}></div>
        <Text weight="medium" style={{ color: COLORS.muted }}>Retrieving team data...</Text>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="bg-red-50 border border-red-100 p-6 sm:p-8 rounded-[32px] flex flex-col gap-6 items-center text-center max-w-md mx-auto mt-6 sm:mt-10">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
           <Target size={32} />
        </div>
        <div>
           <Text weight="bold" size="lg" className="block mb-2" style={{ color: COLORS.danger }}>Team Not Found</Text>
           <Text style={{ color: COLORS.danger }}>{error || "The requested team could not be found or has been deleted."}</Text>
        </div>
        <BackButton onClick={() => router.push('/teams')} />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-w-0 flex-col gap-6 sm:gap-8 pb-20 animate-in fade-in duration-700">
        <div className="flex items-center gap-4 min-w-0">
          <BackButton onClick={() => router.push('/teams')} />
          <div className="h-6 w-px mx-1" style={{ backgroundColor: COLORS.border }}></div>
          <Text as="h1" weight="bold" size="xl" className="truncate" style={{ color: COLORS.text }}>{team.name} Overview</Text>
        </div>

      <div className="bg-white rounded-[32px] p-5 sm:p-8 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden" style={{ border: `1px solid ${COLORS.primaryXlight}` }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 translate-x-12 -translate-y-12"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 w-full xl:w-auto min-w-0">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className="text-white w-16 h-16 rounded-[22px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/20" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
              <Users size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <Text as="h3" weight="bold" size="xl" className="leading-none truncate" style={{ color: COLORS.text }}>{team.name}</Text>
                <div className={`w-2 h-2 rounded-full ${team.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} title={team.status} />
              </div>
              <Text weight="medium" className="block" style={{ color: COLORS.muted }}>{team.users?.length || 0} Members active in this team</Text>
            </div>
          </div>
          
          <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 bg-slate-50 rounded-[20px] p-4 w-full md:w-auto" style={{ border: `1px solid ${COLORS.primaryXlight}` }}>
             <div className="flex flex-col">
                <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>Category</Text>
                <Text size="sm" weight="bold" className="line-clamp-1" style={{ color: COLORS.text }}>{team.category || 'Uncategorized'}</Text>
             </div>
             <div className="flex flex-col">
                <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>Manager</Text>
                <Text size="sm" weight="bold" className="line-clamp-1" style={{ color: COLORS.text }}>{team.manager?.userName || 'Unassigned'}</Text>
             </div>
             <div className="flex flex-col">
                <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>Team Leader</Text>
                <Text size="sm" weight="bold" className="line-clamp-1" style={{ color: COLORS.text }}>
                   {team.teamLeaders && team.teamLeaders.length > 0 
                     ? team.teamLeaders.map(l => l.userName).join(', ') 
                     : 'Unassigned'}
                </Text>
             </div>
          </div>
        </div>

        <div className="flex gap-4 w-full xl:w-auto mt-2 xl:mt-0">
          <button 
            onClick={() => router.push(`/leads_list?teamId=${teamId}`)}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2.5 h-12 px-7 bg-white rounded-full hover:bg-slate-50 shadow-sm transition-all active:scale-95 group font-bold"
            style={{ border: `1px solid ${COLORS.border}`, color: COLORS.text }}
          >
            <Filter size={18} style={{ color: COLORS.primaryDark }} />
            <Text weight="bold" size="sm">View Team Leads</Text>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
           <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: COLORS.primaryDark }}></div>
           <Text weight="bold" size="lg" style={{ color: COLORS.text }}>Performance Metrics</Text>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {leadStatuses.map((status, idx) => (
            <div 
              key={idx} 
              onClick={() => router.push(`/leads_list?teamId=${teamId}${status.name !== "All Leads" ? `&status=${status.name}` : ""}`)}
              className="bg-white rounded-[24px] p-5 flex flex-col items-center justify-center gap-1 shadow-sm transition-all hover:shadow-md cursor-pointer group active:scale-95"
              style={{ border: `1px solid ${COLORS.primaryXlight}` }}
            >
              <Text weight="bold" size="custom" className="group-hover:scale-110 transition-transform" style={{ fontSize: '24px', color: COLORS.primaryDark }}>
                {status.count.toLocaleString()}
              </Text>
              <Text weight="bold" className="text-center uppercase tracking-widest group-hover:text-slate-700" style={{ fontSize: '9px', color: COLORS.muted }}>
                {status.name}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: COLORS.primaryDark }}></div>
              <Text weight="bold" size="lg" style={{ color: COLORS.text }}>Assigned Members</Text>
           </div>
           <div className="flex items-center gap-4">
              <Text size="sm" weight="medium" style={{ color: COLORS.muted }}>{team.users?.length || 0} active</Text>
              <button 
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-4 py-2 text-white rounded-full text-sm font-bold flex items-center gap-2 transition-colors shadow-sm active:scale-95"
                style={{ backgroundColor: COLORS.primaryDark }}
              >
                <UserPlus size={16} />
                Add Member
              </button>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {team.users?.map((member) => (
            <div 
              key={member.id} 
              onClick={() => router.push(`/staffs/${member.id}`)}
              className="bg-white hover:border-slate-200 transition-all rounded-[28px] p-5 shadow-sm flex items-center gap-5 cursor-pointer group hover:shadow-xl hover:-translate-y-1"
              style={{ border: `1px solid ${COLORS.primaryXlight}` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-bold shadow-inner group-hover:text-white transition-all duration-500" style={{ color: COLORS.primaryDark, border: `1px solid ${COLORS.primaryXlight}` }}>
                {member.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <Text weight="bold" size="sm" className="truncate block transition-colors" style={{ color: COLORS.text }}>{member.userName}</Text>
                <div className="flex items-center gap-1.5 mt-1">
                   <Target size={12} style={{ color: COLORS.subtle }} />
                   <Text size="xs" weight="medium" style={{ color: COLORS.muted }}>
                     Leads: <strong style={{ color: COLORS.text }}>{member.leadCounts?.totalLeads || 0}</strong>
                   </Text>
                </div>
              </div>
              <div className="flex flex-col items-end pl-4 border-l" style={{ borderColor: COLORS.primaryXlight }}>
                <Text weight="bold" className="uppercase tracking-widest" style={{ fontSize: '9px', color: COLORS.subtle }}>CLOSED</Text>
                <div className="flex items-center gap-1 mt-0.5">
                   <Text weight="bold" size="lg" className="leading-none" style={{ color: COLORS.success }}>{member.leadCounts?.closedCount || 0}</Text>
                   <TrendingUp size={14} style={{ color: COLORS.light_green }} />
                </div>
              </div>
              <ChevronRight size={18} style={{ color: COLORS.subtle }} className="group-hover:translate-x-1 transition-all" />
            </div>
          ))}
          {(!team.users || team.users.length === 0) && (
            <div className="col-span-full bg-slate-50/50 p-8 sm:p-12 rounded-[32px] border border-dashed text-center" style={{ borderColor: COLORS.border }}>
              <User size={40} className="mx-auto mb-4" style={{ color: COLORS.subtle }} />
              <Text weight="bold" size="lg" className="block mb-1" style={{ color: COLORS.text }}>No Members Assigned</Text>
              <Text className="max-w-xs mx-auto" style={{ color: COLORS.muted }}>This team is currently empty. Invite members to start tracking their performance.</Text>
            </div>
          )}
        </div>
      </div>

    </div>

      {isAddMemberModalOpen && (
        <AddMemberModal 
          teamId={teamId} 
          onClose={() => setIsAddMemberModalOpen(false)} 
          onSuccess={() => {
            setIsAddMemberModalOpen(false);
            refetch();
          }} 
        />
      )}
    </>
  );
}
