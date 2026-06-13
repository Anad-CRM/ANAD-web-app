"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { User, Search, Phone, PlayCircle } from "lucide-react";
import { getSpecificCallLogs, getRecordingUrl } from "@/modules/calls/api/callsApi";
import { CallLog } from "@/modules/calls/types";
import { AudioPlayerModal } from "@/core/components/ui/AudioPlayerModal";
import { BackButton } from "@/core/components/ui/BackButton";
import { Text } from "@/core/components/ui/Text";

const LogsPage = () => {
  const searchParams = useSearchParams();

  const callType = searchParams.get("callType") || "Incoming";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const staffId = searchParams.get("staffId") || "";

  const [logs, setLogs] = useState<CallLog[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingRecordingUrl, setPlayingRecordingUrl] = useState<string | null>(null);

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

      const params: {
        callType: string;
        limit: number;
        startDate?: string;
        endDate?: string;
        staffIds?: string[];
      } = {
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
    } catch {
      return dateString;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 px-4 pb-10 pt-2 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
          <BackButton />
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Text weight="bold" size="custom" className="rounded-full bg-[#1C3A76] px-2.5 py-0.5 uppercase tracking-widest text-white" style={{ fontSize: '10px' }}>Module</Text>
              <Text weight="semibold" size="xs" className="text-slate-400">/ Call Analytics</Text>
            </div>
            <Text as="h1" className="flex flex-wrap items-baseline gap-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {callType} History
              <Text as="span" weight="medium" size="custom" className="text-slate-300" style={{ fontSize: '20px' }}>
                ({totalRecords})
              </Text>
            </Text>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto w-full max-w-5xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-slate-100 bg-white py-24 shadow-sm sm:rounded-[40px] sm:py-32">
            <div className="mb-4 h-14 w-14 rounded-full border-4 border-[#233A78]/20 border-t-[#233A78] animate-spin sm:h-16 sm:w-16"></div>
            <Text weight="bold" size="lg" className="text-slate-500 animate-pulse">Loading all call records...</Text>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-sm sm:rounded-[40px] sm:p-16 lg:p-20">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-200 sm:h-24 sm:w-24">
              <Search size={48} />
            </div>
            <Text as="h2" size="2xl" weight="bold" className="mb-2 text-slate-900">No Records Found</Text>
            <Text className="text-slate-500 max-w-sm mx-auto block">We could not find any call logs matching your selection.</Text>
          </div>
        ) : (
          <div className="grid gap-5">
            {logs.map((call, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-md sm:rounded-[28px] sm:p-5"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1C3A76] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 lg:items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-[#1C3A76] shadow-sm transition-all duration-500 group-hover:bg-[#1C3A76] group-hover:text-white sm:h-14 sm:w-14">
                      <User size={28} strokeWidth={1.5} />
                    </div>

                    <div className="space-y-1 text-center sm:text-left">
                      <Text as="h3" weight="bold" className={`text-lg leading-none tracking-tight sm:text-xl ${call.name === "Unknown Lead" ? "italic text-slate-400" : "text-slate-900"}`}>
                        {call.name}
                      </Text>
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 sm:justify-start">
                        <div className="flex min-w-0 items-center gap-2 text-[#1E40AF]">
                          <Phone size={14} className="opacity-40" />
                          <Text weight="bold" size="sm" className="break-all tracking-tight">{call.number}</Text>
                        </div>
                        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-200"></div>
                        <div className="rounded-md bg-slate-100 px-2.5 py-0.5">
                          <Text weight="bold" className="uppercase tracking-widest text-slate-500" style={{ fontSize: '9px' }}>{call.userName || "System"}</Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-4 border-t border-slate-50 pt-4 sm:justify-center lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    <div className="text-right">
                      <Text weight="bold" className="text-slate-900 block">{call.timestamp ? formatDate(call.timestamp) : "Unknown Date"}</Text>
                      <Text weight="bold" className="text-slate-400 uppercase tracking-widest mt-1 block" style={{ fontSize: '10px' }}>
                        {call.timestamp ? new Date(call.timestamp as string).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--"}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                      <Text weight="bold" className="text-[#1E40AF] uppercase tracking-wide" style={{ fontSize: '10px' }}>{call.duration}</Text>
                    </div>
                  </div>
                </div>

                {/* Audio Component - Adopting RecordingCard style */}
                <div className="mt-4 sm:mt-5">
                  {call.recordingFile ? (
                    <button
                      onClick={() => setPlayingRecordingUrl(getRecordingUrl(call.recordingFile!))}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/40 hover:bg-blue-50 transition-colors rounded-xl border border-blue-100/50 w-full sm:w-auto active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center flex-shrink-0">
                        <PlayCircle size={18} className="text-[#1E40AF]" />
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <Text weight="semibold" className="text-[#1E40AF] text-left truncate w-full" style={{ fontSize: '13px' }}>Play Recording</Text>
                        <Text className="text-blue-600/60" style={{ fontSize: '11px' }}>{call.duration}</Text>
                        {call.recordingDuration && call.duration && call.recordingDuration !== call.duration && (
                          <Text className="text-red-500/80 mt-0.5 font-bold" style={{ fontSize: '10px' }}>Audio: {call.recordingDuration}</Text>
                        )}
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/40 px-4 py-3 text-slate-400 sm:px-5">
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

      <AudioPlayerModal
        isOpen={!!playingRecordingUrl}
        onClose={() => setPlayingRecordingUrl(null)}
        src={playingRecordingUrl || ""}
      />

      <style jsx global>{`
        .p-6.sm\:p-8 {
           padding-bottom: 5rem;
        }
      `}</style>
    </div>
  );
};

export default LogsPage;
