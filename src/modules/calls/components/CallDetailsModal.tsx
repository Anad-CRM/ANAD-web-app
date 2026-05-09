import { X, User, PhoneIncoming, Search, ArrowRight } from "lucide-react";
import { Text } from "@/core/components/ui/Text";
import { useRouter } from "next/navigation";
import { CallLog } from "../types";
import { AudioPlayer } from "@/core/components/ui/AudioPlayer";
import { getRecordingUrl } from "../api/callsApi";

interface CallDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  calls: CallLog[];
  totalCount?: number;
  isLoading: boolean;
  filters?: {
    callType: string;
    startDate?: string;
    endDate?: string;
    staffId?: string;
  };
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

export const CallDetailsModal: React.FC<CallDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  calls,
  totalCount,
  isLoading,
  filters,
}) => {
  const router = useRouter();
  if (!isOpen) return null;

  const displayedCalls = calls.slice(0, 4);
  const effectiveTotalCount = totalCount ?? calls.length;
  const showSeeMore = effectiveTotalCount > 4;

  const handleSeeMore = () => {
    const params = new URLSearchParams();
    if (filters) {
      params.set("callType", filters.callType);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.staffId) params.set("staffId", filters.staffId);
    }
    router.push(`/calls/logs?${params.toString()}`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto pt-[5vh]"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 relative mb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#233A78] px-6 py-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <PhoneIncoming size={24} className="text-white" />
               </div>
                <div>
                   <Text as="h3" weight="bold" className="tracking-tight" style={{ fontSize: '22px' }}>{title}</Text>
                   <Text weight="medium" size="sm" className="text-blue-100/70 mt-0.5">
                     Recent {displayedCalls.length} of {effectiveTotalCount} logs
                   </Text>
                </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F8FAFC]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-12 h-12 border-4 border-[#233A78]/20 border-t-[#233A78] rounded-full animate-spin"></div>
              <Text weight="medium" className="text-slate-500">Fetching details...</Text>
            </div>
          ) : calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-10">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <Search size={32} className="text-slate-300" />
              </div>
              <Text as="h4" weight="bold" size="lg" className="text-slate-900">No logs found</Text>
              <Text size="sm" className="text-slate-500 mt-1">There are no call records matching the current filters.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-max">
              {displayedCalls.map((call, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full hover:border-slate-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-[#233A78] group-hover:bg-[#233A78] group-hover:text-white transition-all duration-300 flex-shrink-0 border border-slate-100 shadow-sm">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <Text weight="bold" className={`truncate tracking-tight ${call.name === "Unknown Lead" ? "text-slate-400" : "text-slate-900"}`} style={{ fontSize: '16px' }}>
                          {call.name}
                        </Text>
                        <Text weight="semibold" className="text-[#1E40AF] mt-0.5 block truncate" style={{ fontSize: '13px' }}>{call.number}</Text>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Text weight="bold" size="custom" style={{ fontSize: '13px' }} className="text-slate-900 uppercase tracking-tight">{formatDate(call.timestamp)}</Text>
                      <Text weight="bold" className="text-slate-400 uppercase tracking-widest mt-0.5 block" style={{ fontSize: '9px' }}>
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#F1F5F9] rounded-lg border border-slate-200/50">
                       <Text weight="bold" className="text-slate-600 uppercase tracking-wide" style={{ fontSize: '10px' }}>{call.duration}</Text>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50/50 rounded-lg border border-blue-100/50">
                       <Text weight="bold" className="text-[#1E40AF] uppercase tracking-wide" style={{ fontSize: '10px' }}>{call.userName || "System"}</Text>
                    </div>
                  </div>

                  <div className="mt-4">
                    {call.recordingFile ? (
                      <div className="space-y-1.5">
                        <Text weight="bold" className="text-slate-800" style={{ fontSize: '13px' }}>Call Recording</Text>
                        <AudioPlayer 
                          src={getRecordingUrl(call.recordingFile)} 
                          className="w-full !bg-transparent !p-0 !border-0"
                        />
                      </div>
                    ) : (
                       <div className="flex items-center gap-3 px-4 py-3 bg-white/40 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <Text weight="medium" className="text-slate-400 italic" style={{ fontSize: '11px' }}>No recording available</Text>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {showSeeMore && (
                 <button 
                  onClick={handleSeeMore}
                  className="md:col-span-2 w-full mt-4 py-5 bg-[#233A78] text-white rounded-[32px] hover:bg-[#1a2b59] hover:shadow-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  <Text weight="bold" size="custom" className="tracking-tight" style={{ fontSize: '16px' }}>View All {effectiveTotalCount} Records</Text>
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 20px;
            border: 3px solid #F8FAFC;
            background-clip: content-box;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94A3B8;
          }
        `}</style>
      </div>
    </div>
  );
};
