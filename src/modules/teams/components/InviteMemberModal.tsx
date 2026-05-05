"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { InviteService } from "@/modules/invite/services/invite.service";
import { useFeedback } from "@/core/contexts/FeedbackContext";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  senderName: string;
  senderAvatar: string;
  teams: { id: string | number; name: string }[];
  onSuccess: () => void;
}

const ROLES = ["Manager", "Team Leader", "Staff Member", "Students"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert", "None"];

export function InviteMemberModal({
  isOpen,
  onClose,
  organizationId,
  senderName,
  senderAvatar,
  teams,
  onSuccess
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Staff Member");
  const [teamId, setTeamId] = useState("");
  const [skillLevel, setSkillLevel] = useState("Expert");
  const [batchName, setBatchName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useFeedback();

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setRole("Staff Member");
      setTeamId("");
      setSkillLevel("Expert");
      setBatchName("");
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", handler);
    }
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Please enter an email address";
    } else {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (!role) {
      newErrors.role = "Please select a role";
    }

    if ((role === "Team Leader" || role === "Staff Member") && !teamId) {
      newErrors.teamId = "Please select a team";
    }

    if (role === "Students" && !batchName.trim()) {
      newErrors.batchName = "Please enter a batch name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInvite = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await InviteService.sendInvitation({
        senderName,
        senderAvatar,
        organizationId,
        receiverEmail: email.trim(),
        role,
        teamId: (role === "Team Leader" || role === "Staff Member") ? teamId : null,
        skillLevel: role === "Staff Member" ? skillLevel : undefined,
        batchName: role === "Students" ? batchName.trim().toLowerCase().replace(/\s/g, '') : undefined,
      });

      if (res?.status === "success") {
        showToast("Invitation sent successfully", "success");
        onSuccess();
        onClose();
      } else if (res?.status === "Invitation Already Sent") {
        showToast("User with this email already invited", "error");
      } else if (res?.status === "User Already Exists with Organization or Team") {
        showToast("User with this email already has an account", "error");
      } else {
        const errorMsg = (res?.errors as string[])?.length ? (res.errors as string[]).join("\n") : res?.error || "Something went wrong";
        showToast(errorMsg as string, "error");
      }
    } catch {
      showToast("Network error. Please check your connection.", "error");
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
        className="relative w-full max-w-md rounded-[24px] overflow-hidden flex flex-col pt-2 max-h-[90vh]"
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 -8px 40px rgba(13,27,62,0.18)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-100">
          <span className="text-[20px] font-bold text-gray-900">
            {role === "Students" ? "Invite Student" : "Invite new member"}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={18} color="#555" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {/* Email */}
          <div>
            <label className="text-[13px] font-bold mb-2 block" style={{ color: COLORS.text }}>Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value.toLowerCase().replace(/\s/g, ''));
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              placeholder="e.g. user@example.com"
              className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none focus:ring-1 transition-all"
              style={{ borderColor: errors.email ? "red" : "#d1d5db", outlineColor: errors.email ? "red" : COLORS.primary }}
            />
            {errors.email && <p className="text-red-500 text-[12px] mt-1.5">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="text-[13px] font-bold mb-2 block" style={{ color: COLORS.text }}>Select Role *</label>
            <select
              value={role}
              onChange={e => {
                setRole(e.target.value);
                if (errors.role) setErrors({ ...errors, role: "" });
              }}
              className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none focus:ring-1 transition-all bg-white"
              style={{ borderColor: errors.role ? "red" : "#d1d5db", outlineColor: errors.role ? "red" : COLORS.primary }}
            >
              <option value="" disabled>Select Role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.role && <p className="text-red-500 text-[12px] mt-1.5">{errors.role}</p>}
          </div>

          {/* Batch Name (for Students) */}
          {role === "Students" && (
            <div>
              <label className="text-[13px] font-bold mb-2 block" style={{ color: COLORS.text }}>Enter Batch Name *</label>
              <input
                type="text"
                value={batchName}
                onChange={e => {
                  setBatchName(e.target.value);
                  if (errors.batchName) setErrors({ ...errors, batchName: "" });
                }}
                placeholder="e.g. Jan2025"
                className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none focus:ring-1 transition-all"
                style={{ borderColor: errors.batchName ? "red" : "#d1d5db", outlineColor: errors.batchName ? "red" : COLORS.primary }}
              />
              {errors.batchName && <p className="text-red-500 text-[12px] mt-1.5">{errors.batchName}</p>}
            </div>
          )}

          {/* Team Selection (for Team Leader / Staff) */}
          {(role === "Team Leader" || role === "Staff Member") && (
            <div>
              <label className="text-[13px] font-bold mb-2 block" style={{ color: COLORS.text }}>Select Team *</label>
              <select
                value={teamId}
                onChange={e => {
                  setTeamId(e.target.value);
                  if (errors.teamId) setErrors({ ...errors, teamId: "" });
                }}
                className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none focus:ring-1 transition-all bg-white"
                style={{ borderColor: errors.teamId ? "red" : "#d1d5db", outlineColor: errors.teamId ? "red" : COLORS.primary }}
              >
                <option value="" disabled>Select Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.teamId && <p className="text-red-500 text-[12px] mt-1.5">{errors.teamId}</p>}
            </div>
          )}

          {/* Skill Level (for Staff Member) */}
          {role === "Staff Member" && (
            <div>
              <label className="text-[13px] font-bold mb-2 block" style={{ color: COLORS.text }}>Select Skill Level *</label>
              <select
                value={skillLevel}
                onChange={e => setSkillLevel(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none focus:ring-1 transition-all bg-white mb-2"
                style={{ borderColor: "#d1d5db", outlineColor: COLORS.primary }}
              >
                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="text-[12px] text-gray-500">
                {skillLevel === 'None' && "Tip: Staffs added under None Skill Level, will get 0 leads."}
                {skillLevel === 'Beginner' && "Tip: Staffs added under Beginner Skill Level will get 1 lead at a time."}
                {skillLevel === 'Intermediate' && "Tip: Staffs added under Intermediate Skill Level will get 2 lead at a time."}
                {skillLevel === 'Expert' && "Tip: Staffs added under Expert Skill Level will get 3 lead at a time."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleInvite}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              boxShadow: `0 4px 14px ${COLORS.primary}50`,
            }}
          >
            {loading ? "Sending Invitation..." : "Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
