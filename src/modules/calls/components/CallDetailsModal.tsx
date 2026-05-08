import { X, User, PhoneIncoming, Search, ArrowRight } from "lucide-react";
import { Text } from "@/core/components/ui/Text";
import { useRouter } from "next/navigation";
import { CallLog } from "../types";
import { AudioPlayer } from "@/core/components/ui/AudioPlayer";
import { API_ENDPOINTS } from "@/core/api/api";

interface CallDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  calls: CallLog[];
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
  isLoading,
  filters,
}) => {
  const router = useRouter();
  if (!isOpen) return null;

  const displayedCalls = calls.slice(0, 4);
  const showSeeMore = calls.length > 4;

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
        className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 relative mb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#233A78] px-8 py-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <PhoneIncoming size={24} className="text-white" />
               </div>
                <div>
                   <Text as="h3" weight="bold" className="tracking-tight" style={{ fontSize: '22px' }}>{title}</Text>
                   <Text weight="medium" size="sm" className="text-blue-100/70 mt-0.5">
                     Recent {displayedCalls.length} of {calls.length} logs
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
            <div className="flex flex-col gap-4">
              {displayedCalls.map((call, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#233A78] group-hover:bg-[#233A78] group-hover:text-white transition-colors duration-300">
                        <User size={22} />
                      </div>
                       <div className="min-w-0">
                        <Text weight="bold" className={`truncate tracking-tight ${call.name === "Unknown Lead" ? "text-slate-400" : "text-slate-900"}`} style={{ fontSize: '17px' }}>
                          {call.name}
                        </Text>
                        <Text weight="semibold" size="sm" className="text-[#1E40AF] mt-0.5">{call.number}</Text>
                      </div>
                    </div>
                     <div className="text-right">
                      <Text weight="bold" size="sm" className="text-slate-900">{formatDate(call.timestamp)}</Text>
                      <Text weight="bold" className="text-slate-400 uppercase tracking-widest mt-1" style={{ fontSize: '11px' }}>
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                         <Text weight="bold" className="text-slate-500" style={{ fontSize: '13px' }}>Duration: {call.duration}</Text>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                         <Text weight="bold" className="text-slate-600 uppercase tracking-wider" style={{ fontSize: '11px' }}>{call.userName || "System"}</Text>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    {call.recordingFile ? (
                      <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100">
                         <AudioPlayer src={API_ENDPOINTS.CALLS.RECORDING(call.recordingFile)} />
                      </div>
                    ) : (
                       <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <Text weight="medium" className="text-slate-400" style={{ fontSize: '12px' }}>No recording available</Text>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {showSeeMore && (
                 <button 
                  onClick={handleSeeMore}
                  className="w-full mt-2 py-4 bg-white border-2 border-dashed border-slate-200 rounded-[32px] text-slate-500 font-bold hover:border-[#233A78] hover:text-[#233A78] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                >
                  <Text weight="bold">View All {calls.length} Records</Text>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
