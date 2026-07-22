"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { User, Search, Phone, PlayCircle, AlertTriangle, SlidersHorizontal, RefreshCw, ArrowUpDown } from "lucide-react";
import { getSpecificCallLogs, getRecordingUrl } from "@/modules/calls/api/callsApi";
import { CallLog } from "@/modules/calls/types";
import { AudioPlayerModal } from "@/core/components/ui/AudioPlayerModal";
import { BackButton } from "@/core/components/ui/BackButton";
import { Text } from "@/core/components/ui/Text";

const LogsPage = () => {
  const searchParams = useSearchParams();

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const staffId = searchParams.get("staffId") || "";

  // Filtration states
  const [selectedCallType, setSelectedCallType] = useState(searchParams.get("callType") || "Incoming");
  const [recordingFilter, setRecordingFilter] = useState<"all" | "with" | "without">("all");
  const [durationMin, setDurationMin] = useState<string>("");
  const [durationMax, setDurationMax] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [logs, setLogs] = useState<CallLog[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingRecordingUrl, setPlayingRecordingUrl] = useState<string | null>(null);

  const updateUrl = (newCallType: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("callType", newCallType);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  const handleCallTypeChange = (type: string) => {
    setSelectedCallType(type);
    updateUrl(type);
  };

  const handleResetFilters = () => {
    setSelectedCallType(searchParams.get("callType") || "Incoming");
    setRecordingFilter("all");
    setDurationMin("");
    setDurationMax("");
    setSortOrder("DESC");
  };

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
        recordingFilter?: "all" | "with" | "without";
        durationMin?: number;
        durationMax?: number;
        sortOrder?: "ASC" | "DESC";
      } = {
        callType: callTypeMap[selectedCallType] || selectedCallType.toLowerCase(),
        limit: 100,
        recordingFilter,
        sortOrder,
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (staffId) params.staffIds = [staffId];
      if (durationMin) params.durationMin = Number(durationMin);
      if (durationMax) params.durationMax = Number(durationMax);

      const { logs: data, totalCount } = await getSpecificCallLogs(params);
      setLogs(data);
      setTotalRecords(totalCount);
      setLoading(false);
    };

    fetchLogs();
  }, [selectedCallType, startDate, endDate, staffId, recordingFilter, durationMin, durationMax, sortOrder]);

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
              {selectedCallType} History
              <Text as="span" weight="medium" size="custom" className="text-slate-300" style={{ fontSize: '20px' }}>
                ({totalRecords})
              </Text>
            </Text>
          </div>
        </div>
      </div>

      {/* Premium Filtration Panel */}
      <div className="mx-auto w-full max-w-5xl mb-6">
        <div className="rounded-[28px] border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-[#1C3A76]">
                <SlidersHorizontal size={18} />
              </span>
              <Text weight="bold" size="base" className="text-slate-800">Advanced Filters</Text>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1C3A76] transition-colors"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Call Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Call Type</label>
              <select
                value={selectedCallType}
                onChange={(e) => handleCallTypeChange(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3A76]/20 focus:border-[#1C3A76] transition-all"
              >
                <option value="Total">Total Calls</option>
                <option value="Incoming">Incoming Calls</option>
                <option value="Outgoing">Outgoing Calls</option>
                <option value="Missed">Missed Calls</option>
                <option value="Rejected">Rejected Calls</option>
                <option value="Personal">Personal Calls</option>
                <option value="New">New Calls</option>
                <option value="NotPickedUp">Not Picked Up</option>
                <option value="Connected">Connected Calls</option>
              </select>
            </div>

            {/* Recording Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recordings</label>
              <select
                value={recordingFilter}
                onChange={(e) => setRecordingFilter(e.target.value as "all" | "with" | "without")}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3A76]/20 focus:border-[#1C3A76] transition-all"
              >
                <option value="all">All Recordings</option>
                <option value="with">With Recording Only</option>
                <option value="without">Without Recording Only</option>
              </select>
            </div>

            {/* Call Duration Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Duration Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min (sec)"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3A76]/20 focus:border-[#1C3A76] transition-all"
                />
                <span className="text-slate-300 font-semibold">-</span>
                <input
                  type="number"
                  placeholder="Max (sec)"
                  value={durationMax}
                  onChange={(e) => setDurationMax(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3A76]/20 focus:border-[#1C3A76] transition-all"
                />
              </div>
            </div>

            {/* Sort Order Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sort Order</label>
              <button
                onClick={() => setSortOrder(prev => prev === "DESC" ? "ASC" : "DESC")}
                className="flex items-center justify-between w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm font-semibold hover:bg-slate-100/50 active:scale-[0.98] transition-all focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpDown size={16} className="text-slate-400" />
                  {sortOrder === "DESC" ? "Newest First" : "Oldest First"}
                </span>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">{sortOrder}</span>
              </button>
            </div>
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

                {/* Audio Component - Premium Style */}
                <div className="mt-4 sm:mt-5">
                  {call.recordingFile ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all duration-300 group-hover:bg-slate-50 group-hover:border-slate-200">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPlayingRecordingUrl(getRecordingUrl(call.recordingFile!))}
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1C3A76] hover:bg-[#152e5d] active:scale-95 shadow-md shadow-[#1C3A76]/20 text-white transition-all"
                          title="Play Call Recording"
                        >
                          <PlayCircle size={22} className="text-white" />
                        </button>
                        <div>
                          <Text weight="bold" className="text-slate-800 text-sm">Call Recording</Text>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Text className="text-slate-400" style={{ fontSize: '11px' }}>Call Duration: {call.duration}</Text>
                          </div>
                        </div>
                      </div>

                      {call.recordingDuration && call.duration && call.recordingDuration !== call.duration ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50/80 border border-rose-100/50 rounded-xl text-rose-800 self-start sm:self-auto shadow-sm">
                          <AlertTriangle size={14} className="text-rose-500 animate-pulse flex-shrink-0" />
                          <div className="flex flex-col">
                            <Text weight="bold" className="text-rose-700" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                              Audio Duration: {call.recordingDuration}
                            </Text>
                            <Text weight="medium" className="text-rose-500" style={{ fontSize: '9px', lineHeight: '1.2' }}>
                              Audio is not fully captured
                            </Text>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/60 border border-emerald-100/40 rounded-xl text-emerald-800 self-start sm:self-auto shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <Text weight="bold" className="text-emerald-700" style={{ fontSize: '11px' }}>
                            Fully Captured
                          </Text>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/40 px-4 py-3.5 text-slate-400 sm:px-5">
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
