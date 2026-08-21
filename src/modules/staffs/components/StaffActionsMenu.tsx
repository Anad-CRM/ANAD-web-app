"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Award, AlertTriangle, X } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { StaffService } from "../services/staff.service";
import type { Staff } from "../types/staff.types";
import { toast } from "sonner";

interface StaffActionsMenuProps {
  staff: Staff;
  onSkillLevelUpdated?: (newLevel: string) => void;
  onStaffDeleted?: () => void;
  buttonClassName?: string;
}

const SKILL_LEVEL_DESCRIPTIONS: Record<string, string> = {
  Beginner: "Staffs added under Beginner Skill Level will get 1 lead at a time.",
  Intermediate: "Staffs added under Intermediate Skill Level will get 2 leads at a time.",
  Expert: "Staffs added under Expert Skill Level will get 3 leads at a time.",
  None: "Staffs added under None Skill Level, will get 0 leads.",
};

const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert", "None"];

export function StaffActionsMenu({
  staff,
  onSkillLevelUpdated,
  onStaffDeleted,
  buttonClassName = "",
}: StaffActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateSkillLevel = async (level: string) => {
    setLoading(true);
    try {
      const res = await StaffService.updateSkillLevel({
        userId: staff.id,
        skillLevel: level,
      });

      if (res.status === "success" || (res as any).status === 200 || (res as any).success) {
        toast.success(`Skill Level updated to ${level} successfully`);
        if (onSkillLevelUpdated) {
          onSkillLevelUpdated(level);
        }
      } else {
        toast.error(res.message || "Failed to update skill level");
      }
    } catch {
      toast.error("An error occurred while updating skill level");
    } finally {
      setLoading(false);
      setSelectedSkill(null);
      setIsOpen(false);
    }
  };

  const handleDeleteStaff = async () => {
    setLoading(true);
    try {
      const res = await StaffService.deleteStaff({
        userId: staff.id,
      });

      if (res.status === "success" || (res as any).status === 200 || (res as any).success) {
        toast.success("Staff member deleted successfully");
        if (onStaffDeleted) {
          onStaffDeleted();
        }
      } else {
        toast.error(res.message || "Failed to delete staff member");
      }
    } catch {
      toast.error("An error occurred while deleting staff member");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setIsOpen(false);
    }
  };

  const isStaffMember = !staff.role || staff.role === "Staff Member" || staff.role === "Staff Members" || staff.role === "Staff";

  return (
    <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      {/* 3-dots Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none ${buttonClassName}`}
        aria-label="Staff options"
      >
        <MoreVertical size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl z-50 py-2 border border-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{ backgroundColor: COLORS.primaryDark }}
        >
          {isStaffMember && (
            <>
              <div className="px-4 py-1.5 text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                Skill Level
              </div>
              {SKILL_LEVELS.map((level) => {
                const isActive = staff.skillLevel?.toLowerCase() === level.toLowerCase();
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setSelectedSkill(level);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[13px] flex items-center justify-between text-white hover:bg-white/10 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Award size={15} style={{ color: isActive ? COLORS.success : COLORS.subtle }} />
                      <span className={isActive ? "font-bold text-white" : "font-normal text-white/80"}>
                        {level}
                      </span>
                    </span>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: COLORS.primary, color: COLORS.primaryLight }}>
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="my-1.5 border-t border-white/10" />
            </>
          )}

          {/* Delete Option */}
          <button
            type="button"
            onClick={() => {
              setShowDeleteConfirm(true);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <Trash2 size={16} className="text-red-400" />
            Delete Staff
          </button>
        </div>
      )}

      {/* Skill Level Confirmation Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-white/10 flex flex-col gap-5 text-white"
            style={{ backgroundColor: COLORS.primaryDark }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: COLORS.primary }}>
                  <Award size={24} style={{ color: COLORS.primaryLight }} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold leading-tight">
                    Change Skill Level: {selectedSkill}
                  </h3>
                  <p className="text-[12px] text-white/60">
                    {staff.userName || "Staff Member"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 rounded-xl text-[13px] leading-relaxed" style={{ backgroundColor: COLORS.primary }}>
              <p className="font-semibold mb-1">
                Are you sure you want to set this member to <span className="underline">{selectedSkill}</span> skill level?
              </p>
              <p className="text-white/70 text-[12px]">
                {SKILL_LEVEL_DESCRIPTIONS[selectedSkill]}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateSkillLevel(selectedSkill)}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 shadow-md flex items-center gap-2"
                style={{ backgroundColor: COLORS.primary }}
              >
                {loading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-white/10 flex flex-col gap-5 text-white"
            style={{ backgroundColor: COLORS.primaryDark }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-500/20 text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-red-400 leading-tight">
                    Delete Staff!
                  </h3>
                  <p className="text-[12px] text-white/60">
                    {staff.userName || "Staff Member"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[14px] text-white/80 leading-relaxed px-1">
              Are you sure you want to delete <strong className="text-white">{staff.userName || "this staff member"}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
              >
                {loading ? "Deleting..." : "Delete Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
