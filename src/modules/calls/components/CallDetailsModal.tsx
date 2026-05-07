import React from "react";
import { X, User, PhoneIncoming, Search } from "lucide-react";
import { CallLog } from "../types";
import { AudioPlayer } from "@/core/components/ui/AudioPlayer";
import { API_ENDPOINTS } from "@/core/api/api";

interface CallDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  calls: CallLog[];
  isLoading: boolean;
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
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto pt-[5vh]"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 relative mb-10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Premium Dark Header */}
        <div className="bg-[#233A78] px-8 py-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <PhoneIncoming size={24} className="text-white" />
               </div>
               <div>
                  <h3 className="text-[22px] font-bold tracking-tight">{title}</h3>
                  <p className="text-blue-100/70 text-sm font-medium mt-0.5">
                    {calls.length} logs found
                  </p>
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F8FAFC]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-[#233A78]/20 border-t-[#233A78] rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Fetching details...</p>
            </div>
          ) : calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-10">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h4 className="text-slate-900 font-bold text-lg">No logs found</h4>
              <p className="text-slate-500 text-sm mt-1">There are no call records matching the current filters.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {calls.map((call, idx) => (
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
                        <p className={`text-[17px] font-bold truncate tracking-tight ${call.name === "Unknown Lead" ? "text-slate-400" : "text-slate-900"}`}>
                          {call.name}
                        </p>
                        <p className="text-sm font-semibold text-[#1E40AF] mt-0.5">{call.number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatDate(call.timestamp)}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                         <span className="text-[13px] font-bold text-slate-500">Duration: {call.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                         <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{call.userName || "System"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audio Player Integration */}
                  <div className="mt-5">
                    {call.recordingFile ? (
                      <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100">
                         <AudioPlayer src={API_ENDPOINTS.CALLS.RECORDING(call.recordingFile)} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <span className="text-[12px] font-medium text-slate-400">No recording available</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
