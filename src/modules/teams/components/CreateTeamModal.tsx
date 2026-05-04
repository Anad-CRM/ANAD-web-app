"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { TeamsService } from "../services/teams.service";
import { useFeedback } from "@/core/contexts/FeedbackContext";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { StaffService } from "@/modules/staffs/services/staff.service";
import { TEAM_ICONS } from "../constants/teamIcons";

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
  const [managers, setManagers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { showToast } = useFeedback();

  useEffect(() => {
    if (isOpen && isAdmin) {
      StaffService.getStaffList({
        organizationId,
        role: "Manager",
      }).then(res => {
        if (res.status === "success") {
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
        showToast(res.message || "Something went wrong", "error");
      }
    } catch (err: any) {
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
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span className="text-[20px] font-bold text-gray-900">
            Create Team
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={18} color="#555" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {/* Team Name */}
          <div>
            <label className="text-[13px] font-bold mb-2 block" style={{ color: COLORS.text }}>Team Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Sales Team Alpha"
              className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none focus:ring-1 transition-all"
              style={{ 
                borderColor: error ? "red" : "#d1d5db", 
                color: COLORS.text, 
                outlineColor: error ? "red" : COLORS.primary 
              }}
            />
            {error && <p className="text-red-500 text-[12px] mt-1.5">{error}</p>}
          </div>

          {/* Admin Manager Assignment */}
          {isAdmin && (
            <div>
              <label className="text-[13px] font-bold mb-2 block" style={{ color: COLORS.text }}>Assign Manager</label>
              <select
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none focus:ring-1 transition-all bg-white"
                style={{ borderColor: "#d1d5db", outlineColor: COLORS.primary }}
              >
                <option value="">Do not assign</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.userName || m.id}</option>
                ))}
              </select>
            </div>
          )}

          {/* Icon Picker */}
          <div>
            <label className="text-[13px] font-bold mb-3 block mt-2" style={{ color: COLORS.text }}>Select Icon</label>
            <div className="grid grid-cols-5 gap-3">
              {TEAM_ICONS.map((Icon, idx) => (
                <button
                  key={idx}
                  onClick={() => setIconIndex(idx)}
                  className={`flex items-center justify-center h-12 rounded-xl transition-all border-2 ${
                    iconIndex === idx ? "shadow-md bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  style={{
                    borderColor: iconIndex === idx ? COLORS.primary : "transparent",
                    color: iconIndex === idx ? COLORS.primary : "#555",
                  }}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              boxShadow: `0 4px 14px ${COLORS.primary}50`,
            }}
          >
            {loading ? "Creating..." : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
}
