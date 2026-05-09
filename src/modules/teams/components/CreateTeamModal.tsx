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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(13,27,62,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-[24px] overflow-hidden flex flex-col pt-2"
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 -8px 40px rgba(13,27,62,0.18)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-5 pb-3">
          <Text as="h3" weight="bold" size="lg" className="text-slate-900 tracking-tight">Create Team</Text>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {/* Team Name */}
          <div>
            <Text weight="bold" size="custom" className="text-slate-700 mb-2 block" style={{ fontSize: '13px' }}>Team Name *</Text>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Sales Team Alpha"
              className="w-full rounded-2xl px-4 py-3.5 text-[14px] border outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-400"
              style={{ 
                borderColor: error ? "#EF4444" : "#E2E8F0", 
                color: "#0F172A", 
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
              <Text weight="bold" size="custom" className="text-slate-700 mb-2 block" style={{ fontSize: '13px' }}>Assign Manager</Text>
              <select
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                className="w-full rounded-2xl px-4 py-3.5 text-[14px] border outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-white font-medium text-slate-900 border-[#E2E8F0]"
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
            <Text weight="bold" size="custom" className="text-slate-700 mb-3 block" style={{ fontSize: '13px' }}>Identity & Icon</Text>
            <div className="grid grid-cols-5 gap-3">
              {TEAM_ICONS.map((Icon, idx) => (
                <button
                  key={idx}
                  onClick={() => setIconIndex(idx)}
                  className={`flex items-center justify-center h-12 rounded-xl transition-all border-2 relative group overflow-hidden ${
                    iconIndex === idx ? "bg-blue-50 border-[#233A78] shadow-sm" : "bg-slate-50 border-transparent hover:bg-slate-100"
                  }`}
                >
                  <Icon size={20} className={iconIndex === idx ? "text-[#233A78]" : "text-slate-500"} />
                  {iconIndex === idx && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#233A78] rounded-full border-2 border-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 bg-slate-50/50 border-t border-slate-100">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full h-12 rounded-2xl flex items-center justify-center bg-[#233A78] text-white shadow-lg shadow-blue-900/20 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
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
    </div>
  );
}
