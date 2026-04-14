import React from "react";
import { EodStaffMember } from "../types";

interface StaffListProps {
  staff: EodStaffMember[];
  selectedId?: string;
  onSelect: (staff: EodStaffMember) => void;
}

export const StaffList = ({ staff, selectedId, onSelect }: StaffListProps) => {
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 font-sans overflow-hidden">
      <div className="flex items-center justify-end mb-4">
        <span className="text-[12px] text-gray-500 font-medium">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-start gap-2 overflow-y-auto pr-1 custom-scrollbar overflow-x-hidden min-h-0">
        {staff.map((member) => {
          const isSelected = member.userId === selectedId;
          return (
            <button
              key={member.userId}
              onClick={() => onSelect(member)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left flex-shrink-0 ${
                isSelected
                  ? "bg-[#233A78] text-white shadow-md"
                  : "bg-[#EAEFF5] text-gray-900 hover:bg-[#D6E4F0]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 ${
                  isSelected ? "border-white/20" : "border-gray-200"
                }`}
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center text-[13px] font-bold ${
                      isSelected ? "text-[#233A78]" : "text-gray-400"
                    }`}
                  >
                    {member.userName?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start min-w-0">
                <span className="text-[13px] font-bold line-clamp-1 leading-tight">
                  {member.userName || "Unknown User"}
                </span>
                <span
                  className={`text-[11px] font-medium leading-tight ${
                    isSelected ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {member.role || "Staff Member"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button className="mt-4 self-center bg-[#233A78] text-white px-6 py-2 rounded-full font-bold text-[12px] shadow-sm hover:bg-[#3561A5] transition-colors flex-shrink-0">
        View more
      </button>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #233a7866;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #233a7899;
        }
      `}</style>
    </div>
  );
};
