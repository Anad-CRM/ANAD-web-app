"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PhoneIncoming, ArrowLeft, User, Search, Phone } from "lucide-react";
import { getSpecificCallLogs } from "@/modules/calls/api/callsApi";
import { CallLog } from "@/modules/calls/types";
import { AudioPlayer } from "@/core/components/ui/AudioPlayer";
import { API_ENDPOINTS } from "@/core/api/api";

const LogsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const callType = searchParams.get("callType") || "Incoming";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const staffId = searchParams.get("staffId") || "";

  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const params: any = {
        callType: callType.toLowerCase().replace(" ", ""),
        limit: 100, 
      };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (staffId) params.staffIds = [staffId];

      const data = await getSpecificCallLogs(params);
      setLogs(data);
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
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen font-sans animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-slate-100 text-slate-600 hover:text-[#233A78]"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-[#233A78] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Module</span>
               <span className="text-slate-400 text-xs font-semibold">/ Call Analytics</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {callType} History 
              <span className="text-slate-400 font-medium ml-3 text-xl">({logs.length})</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] shadow-sm border border-slate-100">
            <div className="w-16 h-16 border-4 border-[#233A78]/20 border-t-[#233A78] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold text-lg animate-pulse">Loading all call records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 shadow-sm border border-slate-100 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Search size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Records Found</h2>
            <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any call logs matching your selection.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {logs.map((call, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[40px] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-[#233A78] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-16 h-16 bg-[#233A78]/5 rounded-[22px] flex items-center justify-center text-[#233A78] group-hover:bg-[#233A78] group-hover:text-white transition-all duration-500">
                      <User size={32} strokeWidth={1.5} />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className={`text-2xl font-black tracking-tight ${call.name === "Unknown Lead" ? "text-slate-400 italic" : "text-slate-900"}`}>
                        {call.name}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[#1E40AF] font-bold">
                          <Phone size={14} fill="currentColor" className="opacity-20" />
                          <span>{call.number}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                        <div className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                          {call.userName || "System"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 border-slate-100 pt-6 lg:pt-0 gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{formatDate(call.timestamp)}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                       <div className="w-2h-2 rounded-full bg-blue-500 animate-pulse"></div>
                       <span className="text-sm font-black text-[#1E40AF]">Duration: {call.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Audio Component */}
                <div className="mt-8 pt-8 border-t border-slate-100/50">
                  {call.recordingFile ? (
                    <div className="bg-slate-50/50 rounded-3xl p-2 border border-slate-200/50 group-hover:border-blue-200 transition-colors">
                       <AudioPlayer src={API_ENDPOINTS.CALLS.RECORDING(call.recordingFile)} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                      <span className="text-sm font-medium">No recording available for this session</span>
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
