"use client";

import { useTeamDetails } from "@/modules/teams/hooks/useTeamDetails";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/core/components/ui/BackButton";
import { Text } from "@/core/components/ui/Text";
import { Users, Filter, User, Target, TrendingUp, ChevronRight } from "lucide-react";

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const { team, leadCounts, totalLeads, isLoading, error } = useTeamDetails(teamId);

  const leadStatuses = [
    { name: "All Leads", count: totalLeads },
    { name: "New Lead", count: leadCounts?.newLead || 0 },
    { name: "Hot Lead", count: leadCounts?.hotLead || 0 },
    { name: "Contacted", count: leadCounts?.contacted || 0 },
    { name: "Follow Up", count: leadCounts?.followUp || 0 },
    { name: "RNR", count: leadCounts?.rnr || 0 },
    { name: "Busy", count: leadCounts?.busy || 0 },
    { name: "Switch Off", count: leadCounts?.switchedOff || 0 },
    { name: "Not Interested", count: leadCounts?.notInterested || 0 },
    { name: "Register", count: leadCounts?.registered || 0 },
    { name: "Closed", count: leadCounts?.closed || 0 },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#233A78]"></div>
        <Text weight="medium" className="text-slate-500">Retrieving team data...</Text>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] flex flex-col gap-6 items-center text-center max-w-md mx-auto mt-10">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
           <Target size={32} />
        </div>
        <div>
           <Text weight="bold" size="lg" className="text-red-900 block mb-2">Team Not Found</Text>
           <Text className="text-red-700/80">{error || "The requested team could not be found or has been deleted."}</Text>
        </div>
        <BackButton onClick={() => router.push('/teams')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <BackButton onClick={() => router.push('/teams')} />
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        <Text as="h1" weight="bold" size="xl" className="text-slate-900">{team.name} Overview</Text>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 translate-x-12 -translate-y-12"></div>
        
        <div className="flex items-center gap-6">
          <div className="bg-[#233A78] text-white w-16 h-16 rounded-[22px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/10">
            <Users size={28} />
          </div>
          <div>
            <Text as="h3" weight="bold" size="xl" className="text-slate-900 mb-1 leading-none">{team.name}</Text>
            <Text weight="medium" className="text-slate-500 block">{team.users?.length || 0} Members active in this team</Text>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => router.push(`/leads_list?teamId=${teamId}`)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2.5 h-12 px-7 bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95 group font-bold"
          >
            <Filter size={18} className="text-[#233A78]" />
            <Text weight="bold" size="sm">View Team Leads</Text>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
           <div className="w-1.5 h-5 bg-[#233A78] rounded-full"></div>
           <Text weight="bold" size="lg" className="text-slate-900">Performance Metrics</Text>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {leadStatuses.map((status, idx) => (
            <div 
              key={idx} 
              onClick={() => router.push(`/leads_list?teamId=${teamId}${status.name !== "All Leads" ? `&status=${status.name}` : ""}`)}
              className="bg-white border border-slate-100 rounded-[24px] p-5 flex flex-col items-center justify-center gap-1 shadow-sm transition-all hover:shadow-md hover:border-blue-100 cursor-pointer group active:scale-95"
            >
              <Text weight="bold" size="custom" className="text-[#233A78] group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>
                {status.count.toLocaleString()}
              </Text>
              <Text weight="bold" className="text-slate-500 text-center uppercase tracking-widest group-hover:text-slate-700" style={{ fontSize: '9px' }}>
                {status.name}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-[#233A78] rounded-full"></div>
              <Text weight="bold" size="lg" className="text-slate-900">Assigned Members</Text>
           </div>
           <Text size="sm" weight="medium" className="text-slate-500">{team.users?.length || 0} active</Text>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.users?.map((member) => (
            <div 
              key={member.id} 
              onClick={() => router.push(`/staffs/${member.id}`)}
              className="bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-[28px] p-5 shadow-sm flex items-center gap-5 cursor-pointer group hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-bold text-[#233A78] shadow-inner group-hover:bg-[#233A78] group-hover:text-white transition-all duration-500 border border-slate-100">
                {member.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <Text weight="bold" size="sm" className="text-slate-900 truncate block group-hover:text-[#233A78] transition-colors">{member.userName}</Text>
                <div className="flex items-center gap-1.5 mt-1">
                   <Target size={12} className="text-slate-400" />
                   <Text size="xs" weight="medium" className="text-slate-500">
                     Leads: <strong className="text-slate-700">{member.leadCounts?.totalLeads || 0}</strong>
                   </Text>
                </div>
              </div>
              <div className="flex flex-col items-end pl-4 border-l border-slate-50">
                <Text weight="bold" className="text-slate-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>CLOSED</Text>
                <div className="flex items-center gap-1 mt-0.5">
                   <Text weight="bold" size="lg" className="text-emerald-600 leading-none">{member.leadCounts?.closedCount || 0}</Text>
                   <TrendingUp size={14} className="text-emerald-400" />
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
          {(!team.users || team.users.length === 0) && (
            <div className="col-span-full bg-slate-50/50 p-12 rounded-[32px] border border-dashed border-slate-200 text-center">
              <User size={40} className="mx-auto text-slate-300 mb-4" />
              <Text weight="bold" size="lg" className="text-slate-900 block mb-1">No Members Assigned</Text>
              <Text className="text-slate-500 max-w-xs mx-auto">This team is currently empty. Invite members to start tracking their performance.</Text>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
