"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { TeamsService } from "../services/teams.service";
import { useFeedback } from "@/core/contexts/FeedbackContext";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { StaffService } from "@/modules/staffs/services/staff.service";
import { Staff } from "@/modules/staffs/types/staff.types";
import { TEAM_ICONS } from "../constants/teamIcons";
import { Text } from "@/core/components/ui/Text";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess: () => void;
}

export function CreateTeamModal({ isOpen, onClose, organizationId, onSuccess }: CreateTeamModalProps) {
  const { user } = useAuthContext();
  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "superadmin";
  const userManagerId = String(user?.id || "");

  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [iconIndex, setIconIndex] = useState(0);
  const [managers, setManagers] = useState<Staff[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { showToast } = useFeedback();

  useEffect(() => {
    if (isOpen && isAdmin) {
      StaffService.getStaffList({
        organizationId,
        role: "Manager",
        date: new Date().toISOString(),
      }).then(res => {
        if (res.status === "success" && Array.isArray(res.data)) {
          setManagers(res.data);
        }
      }).catch(console.error);
    }
  }, [isOpen, isAdmin, organizationId]);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setManagerId("");
      setIconIndex(0);
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", handler);
    }
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Please enter team name");
      showToast("Please enter a team name", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await TeamsService.createTeam({
        organizationId,
        name: name.trim(),
        managerId: isAdmin ? (managerId || undefined) : userManagerId,
        iconIndex: iconIndex,
      });
      if (res.status === "success" || res.data) {
        showToast("Team created successfully", "success");
        onSuccess();
        onClose();
      } else {
        showToast((res.message as string) || "Something went wrong", "error");
      }
    } catch {
      showToast("Failed to create team. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(13,27,62,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-[min(100vw-1rem,24rem)] sm:w-full max-w-sm rounded-t-[24px] sm:rounded-[24px] overflow-hidden flex flex-col pt-2"
        style={{
          backgroundColor: COLORS.surface,
          boxShadow: "0 -8px 40px rgba(13,27,62,0.18)",
          animation: "slideUp 0.25s cubic-bezier(.4,0,.2,1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1 mt-2 sm:hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 pb-3">
          <Text as="h3" weight="bold" size="lg" className="tracking-tight" style={{ color: COLORS.text }}>Create Team</Text>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: COLORS.primaryXlight, border: `1px solid ${COLORS.border}` }}
          >
            <X size={18} style={{ color: COLORS.muted }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(85vh - 120px)" }}>
          {/* Team Name */}
          <div>
            <Text weight="bold" size="custom" className="mb-2 block" style={{ fontSize: '13px', color: COLORS.text }}>Team Name *</Text>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Sales Team Alpha"
              className="w-full rounded-2xl px-4 py-3.5 text-[14px] border outline-none focus:ring-2 transition-all font-medium placeholder:text-slate-400"
              style={{ 
                borderColor: error ? COLORS.danger : COLORS.border,
                color: COLORS.text,
              }}
            />
            {error && (
              <div className="flex items-center gap-1.5 mt-2 ml-1">
                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                <Text weight="medium" size="xs" className="text-red-500">{error}</Text>
              </div>
            )}
          </div>

          {/* Admin Manager Assignment */}
          {isAdmin && (
            <div>
              <Text weight="bold" size="custom" className="mb-2 block" style={{ fontSize: '13px', color: COLORS.text }}>Assign Manager</Text>
              <select
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                className="w-full rounded-2xl px-4 py-3.5 text-[14px] border outline-none focus:ring-2 transition-all bg-white font-medium"
                style={{ color: COLORS.text, borderColor: COLORS.border }}
              >
                <option value="">Do not assign</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.userName || (m.id as string)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Icon Picker */}
          <div>
            <Text weight="bold" size="custom" className="mb-3 block" style={{ fontSize: '13px', color: COLORS.text }}>Identity & Icon</Text>
            <div className="grid grid-cols-5 gap-3">
              {TEAM_ICONS.map((Icon, idx) => (
                <button
                  key={idx}
                  onClick={() => setIconIndex(idx)}
                  className={`flex items-center justify-center h-12 rounded-xl transition-all border-2 relative group overflow-hidden ${
                    iconIndex === idx ? "shadow-sm" : "hover:bg-slate-100"
                  }`}
                  style={{
                    backgroundColor: iconIndex === idx ? COLORS.primaryXlight : COLORS.c,
                    borderColor: iconIndex === idx ? COLORS.primaryDark : "transparent",
                  }}
                >
                  <Icon size={20} style={{ color: iconIndex === idx ? COLORS.primaryDark : COLORS.muted }} />
                  {iconIndex === idx && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: COLORS.primaryDark }}></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-5 border-t" style={{ backgroundColor: COLORS.primaryXlight, borderColor: COLORS.border }}>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full h-12 rounded-2xl flex items-center justify-center text-white shadow-lg hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            style={{ backgroundColor: COLORS.primaryDark }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <Text weight="bold" size="sm">Creating...</Text>
              </div>
            ) : (
              <Text weight="bold" size="sm">Create Team</Text>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(30px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>
    </div>
  );
}
