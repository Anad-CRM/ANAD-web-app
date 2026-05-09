"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PhoneIncoming, User, Search, Phone } from "lucide-react";
import { getSpecificCallLogs, getRecordingUrl } from "@/modules/calls/api/callsApi";
import { CallLog } from "@/modules/calls/types";
import { AudioPlayer } from "@/core/components/ui/AudioPlayer";
import { BackButton } from "@/core/components/ui/BackButton";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

const LogsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const callType = searchParams.get("callType") || "Incoming";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const staffId = searchParams.get("staffId") || "";

  const [logs, setLogs] = useState<CallLog[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const callTypeMap: Record<string, string> = {
        "Total": "totalCalls",
        "Incoming": "incoming",
        "Outgoing": "outgoing",
        "Missed": "missed",
        "Rejected": "rejected",
        "Personal": "personalCalls",
        "New": "newCalls",
        "NotPickedUp": "notPickedUpCalls",
        "Connected": "connected"
      };

      const params: any = {
        callType: callTypeMap[callType as string] || callType.toLowerCase(),
        limit: 100, 
      };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (staffId) params.staffIds = [staffId];

      const { logs: data, totalCount } = await getSpecificCallLogs(params);
      setLogs(data);
      setTotalRecords(totalCount);
      setLoading(false);
    };

    fetchLogs();
  }, [callType, startDate, endDate, staffId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-5">
          <BackButton />
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Text weight="bold" size="custom" className="bg-[#1C3A76] text-white px-2.5 py-0.5 rounded-full uppercase tracking-widest" style={{ fontSize: '10px' }}>Module</Text>
               <Text weight="semibold" size="xs" className="text-slate-400">/ Call Analytics</Text>
            </div>
            <Text as="h1" className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {callType} History 
              <Text as="span" weight="medium" size="custom" className="text-slate-300" style={{ fontSize: '24px' }}>({totalRecords})</Text>
            </Text>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] shadow-sm border border-slate-100">
            <div className="w-16 h-16 border-4 border-[#233A78]/20 border-t-[#233A78] rounded-full animate-spin mb-4"></div>
            <Text weight="bold" size="lg" className="text-slate-500 animate-pulse">Loading all call records...</Text>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 shadow-sm border border-slate-100 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Search size={48} />
            </div>
            <Text as="h2" size="2xl" weight="bold" className="text-slate-900 mb-2">No Records Found</Text>
            <Text className="text-slate-500 max-w-sm mx-auto block">We couldn't find any call logs matching your selection.</Text>
          </div>
        ) : (
          <div className="grid gap-5">
            {logs.map((call, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1C3A76] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1C3A76] group-hover:bg-[#1C3A76] group-hover:text-white transition-all duration-500 border border-slate-100 shadow-sm">
                      <User size={28} strokeWidth={1.5} />
                    </div>
                    
                    <div className="space-y-1 text-center sm:text-left">
                      <Text as="h3" weight="bold" className={`text-xl tracking-tight leading-none ${call.name === "Unknown Lead" ? "text-slate-400 italic" : "text-slate-900"}`}>
                        {call.name}
                      </Text>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 pt-1">
                        <div className="flex items-center gap-2 text-[#1E40AF]">
                          <Phone size={14} className="opacity-40" />
                          <Text weight="bold" size="sm" className="tracking-tight">{call.number}</Text>
                        </div>
                        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-200"></div>
                        <div className="px-2.5 py-0.5 bg-slate-100 rounded-md">
                           <Text weight="bold" className="text-slate-500 uppercase tracking-widest" style={{ fontSize: '9px' }}>{call.userName || "System"}</Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between sm:justify-center lg:justify-center border-t lg:border-t-0 border-slate-50 pt-5 lg:pt-0 gap-4">
                    <div className="text-right">
                      <Text weight="bold" className="text-slate-900 block">{formatDate(call.timestamp)}</Text>
                      <Text weight="bold" className="text-slate-400 uppercase tracking-widest mt-1 block" style={{ fontSize: '10px' }}>
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/30">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                       <Text weight="bold" className="text-[#1E40AF] uppercase tracking-wide" style={{ fontSize: '10px' }}>{call.duration}</Text>
                    </div>
                  </div>
                </div>

                {/* Audio Component - Adopting RecordingCard style */}
                <div className="mt-5">
                  {call.recordingFile ? (
                    <div className="space-y-2">
                       <Text weight="bold" className="text-slate-800" style={{ fontSize: '13px' }}>Call Recording</Text>
                       <AudioPlayer 
                         src={getRecordingUrl(call.recordingFile)} 
                         className="w-full max-w-[300px] !bg-transparent !p-0 !border-0"
                       />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-5 py-3 bg-white/40 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <Text size="sm" weight="medium" className="italic">No recording available for this session</Text>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .p-6.sm\:p-8 {
           padding-bottom: 5rem;
        }
      `}</style>
    </div>
  );
};

export default LogsPage;
