import React from "react";
import { EodStaffMember } from "../types";

interface StaffListProps {
  staff: EodStaffMember[];
  selectedId?: string;
  onSelect: (staff: EodStaffMember) => void;
}

export const StaffList = ({ staff, selectedId, onSelect }: StaffListProps) => {
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 font-sans overflow-hidden">
      <div className="flex items-center justify-end mb-6">
          <span className="text-[14px] text-gray-700 font-medium">Tuesday , 03 Mar 2026</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
        {staff.map((member) => {
          const isSelected = member.userId === selectedId;
          return (
            <button
              key={member.userId}
              onClick={() => onSelect(member)}
              className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${
                isSelected 
                  ? "bg-[#233A78] text-white shadow-md transform scale-[1.02]" 
                  : "bg-[#EAEFF5] text-gray-900 hover:bg-[#D6E4F0]"
              }`}
            >
              <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 ${isSelected ? 'border-white/20' : 'border-gray-200'}`}>
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.userName} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${isSelected ? 'text-[#233A78]' : 'text-gray-400'}`}>
                    {member.userName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[17px] font-bold line-clamp-1">{member.userName || "Unknown User"}</span>
                <span className={`text-[12px] ${isSelected ? 'text-white/80' : 'text-gray-500'} font-medium`}>{member.role}</span>
              </div>
            </button>
          );
        })}
      </div>

      <button className="mt-8 self-center bg-[#233A78] text-white px-6 py-2.5 rounded-full font-bold text-[14px] shadow-sm hover:bg-[#3561A5] transition-colors">
        View more
      </button>

      <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 20px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #233A7866;
              border-radius: 20px;
              border: 2px solid #f1f1f1;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #233A7899;
            }
      `}</style>
    </div>
  );
};
