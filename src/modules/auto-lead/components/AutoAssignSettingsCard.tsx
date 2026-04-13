import React from 'react';

interface Props {
  autoAssign: boolean;
  onToggleAutoAssign: () => void;
  attendanceReq: boolean;
  onToggleAttendance: () => void;
  activeAdsCount: number;
}

export const AutoAssignSettingsCard: React.FC<Props> = ({ 
  autoAssign, 
  onToggleAutoAssign, 
  attendanceReq, 
  onToggleAttendance,
  activeAdsCount 
}) => {
  return (
    <div className="bg-[#F8F7F3] rounded-2xl p-6 shadow-sm h-[180px] flex flex-col justify-center space-y-6">
       <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-[#1A1A1A] font-semibold text-[15px] mb-1.5">Smart Auto Assign</h3>
            <p className="text-[#64748B] text-[11px] leading-snug tracking-tight">Intelligently distribute leads based on availability ,skill level , and timing Active for {activeAdsCount} selected ads</p>
          </div>
          <button 
            onClick={onToggleAutoAssign}
            className={`w-9 h-5 rounded-full flex items-center p-[2px] transition-colors flex-shrink-0 ${autoAssign ? 'bg-[#1C3A76]' : 'bg-black'}`}
          >
             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoAssign ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
       </div>

       <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-[#1A1A1A] font-semibold text-[15px] mb-1.5">Require Attendance</h3>
            <p className="text-[#64748B] text-[11px] leading-snug tracking-tight">Only presents staff will receive leads</p>
          </div>
          <button 
             onClick={onToggleAttendance}
             className={`w-9 h-5 rounded-full flex items-center p-[2px] transition-colors flex-shrink-0 ${attendanceReq ? 'bg-[#1C3A76]' : 'bg-black'}`}
          >
             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${attendanceReq ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
       </div>
    </div>
  );
};

