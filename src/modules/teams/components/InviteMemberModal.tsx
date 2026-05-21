"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { InviteService } from "@/modules/invite/services/invite.service";
import { useFeedback } from "@/core/contexts/FeedbackContext";
import { Text } from "@/core/components/ui/Text";
import { Mail, Shield, Users, Layers, Info } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(13,27,62,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-[min(100vw-1rem,28rem)] sm:w-full max-w-md rounded-t-[24px] sm:rounded-[24px] overflow-hidden flex flex-col pt-2 max-h-[90vh]"
        style={{
          backgroundColor: COLORS.surface,
          boxShadow: "0 -8px 40px rgba(13,27,62,0.18)",
          animation: "slideUp 0.25s cubic-bezier(.4,0,.2,1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1 mt-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 pb-3 border-b" style={{ borderColor: COLORS.primaryXlight, backgroundColor: "rgba(238,244,251,0.3)" }}>
          <Text as="h3" weight="bold" size="lg" className="tracking-tight" style={{ color: COLORS.text }}>
            {role === "Students" ? "Invite Student" : "Invite Member"}
          </Text>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            style={{ backgroundColor: "rgba(255,255,255,0.5)", border: `1px solid ${COLORS.primaryXlight}` }}
          >
            <X size={18} style={{ color: COLORS.muted }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {/* Email */}
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Mail size={14} style={{ color: COLORS.subtle }} />
               <Text weight="bold" size="custom" className="" style={{ fontSize: '13px', color: COLORS.text }}>Email Address *</Text>
            </div>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value.toLowerCase().replace(/\s/g, ''));
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              placeholder="e.g. user@example.com"
              className="w-full rounded-2xl px-4 py-3.5 text-[14px] border outline-none focus:ring-2 transition-all font-medium placeholder:text-slate-400"
              style={{ borderColor: errors.email ? COLORS.danger : COLORS.border, color: COLORS.text }}
            />
            {errors.email && (
               <div className="flex items-center gap-1.5 mt-2 ml-1">
                 <div className="w-1 h-1 rounded-full bg-red-500"></div>
               <Text weight="medium" size="xs" style={{ color: COLORS.danger }}>{errors.email}</Text>
               </div>
            )}
          </div>

          {/* Role */}
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Shield size={14} style={{ color: COLORS.subtle }} />
               <Text weight="bold" size="custom" style={{ fontSize: '13px', color: COLORS.text }}>Select Role *</Text>
            </div>
            <select
              value={role}
              onChange={e => {
                setRole(e.target.value);
                if (errors.role) setErrors({ ...errors, role: "" });
              }}
              className="w-full rounded-2xl px-4 py-3.5 text-[14px] border outline-none focus:ring-2 transition-all bg-white font-medium"
              style={{ color: COLORS.text, borderColor: COLORS.border }}
            >
              <option value="" disabled>Select Role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.role && (
               <div className="flex items-center gap-1.5 mt-2 ml-1">
                 <div className="w-1 h-1 rounded-full bg-red-500"></div>
                 <Text weight="medium" size="xs" style={{ color: COLORS.danger }}>{errors.role}</Text>
               </div>
            )}
          </div>

          {/* Batch Name (for Students) */}
          {role === "Students" && (
            <div>
              <Text weight="bold" size="custom" className="mb-2 block" style={{ fontSize: '13px', color: COLORS.text }}>Enter Batch Name *</Text>
              <input
                type="text"
                value={batchName}
                onChange={e => {
                  setBatchName(e.target.value);
                  if (errors.batchName) setErrors({ ...errors, batchName: "" });
                }}
                placeholder="e.g. Jan2025"
                className="w-full rounded-2xl px-4 py-3.5 text-[14px] border outline-none focus:ring-2 transition-all font-medium placeholder:text-slate-400"
                style={{ borderColor: errors.batchName ? COLORS.danger : COLORS.border, color: COLORS.text }}
              />
              {errors.batchName && (
                 <div className="flex items-center gap-1.5 mt-2 ml-1">
                   <div className="w-1 h-1 rounded-full bg-red-500"></div>
                   <Text weight="medium" size="xs" style={{ color: COLORS.danger }}>{errors.batchName}</Text>
                 </div>
              )}
            </div>
          )}

          {/* Team Selection (for Team Leader / Staff) */}
          {(role === "Team Leader" || role === "Staff Member") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <Users size={14} style={{ color: COLORS.subtle }} />
                 <Text weight="bold" size="custom" style={{ fontSize: '13px', color: COLORS.text }}>Select Team *</Text>
              </div>
              <select
                value={teamId}
                onChange={e => {
                  setTeamId(e.target.value);
                  if (errors.teamId) setErrors({ ...errors, teamId: "" });
                }}
                className="w-full rounded-2xl px-4 py-3.5 text-[14px] border outline-none focus:ring-2 transition-all bg-white font-medium"
                style={{ color: COLORS.text, borderColor: COLORS.border }}
              >
                <option value="" disabled>Select Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.teamId && (
                 <div className="flex items-center gap-1.5 mt-2 ml-1">
                   <div className="w-1 h-1 rounded-full bg-red-500"></div>
                   <Text weight="medium" size="xs" style={{ color: COLORS.danger }}>{errors.teamId}</Text>
                 </div>
              )}
            </div>
          )}

          {/* Skill Level (for Staff Member) */}
          {role === "Staff Member" && (
            <div className="bg-slate-50/80 p-4 rounded-2xl" style={{ border: `1px solid ${COLORS.primaryXlight}` }}>
              <div className="flex items-center gap-2 mb-3">
                 <Layers size={14} style={{ color: COLORS.subtle }} />
                 <Text weight="bold" size="custom" style={{ fontSize: '13px', color: COLORS.text }}>Skill Level *</Text>
              </div>
              <select
                value={skillLevel}
                onChange={e => setSkillLevel(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-[14px] border outline-none focus:ring-2 transition-all bg-white font-medium mb-3"
                style={{ color: COLORS.text, borderColor: COLORS.border }}
              >
                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex items-start gap-2 pt-1 mt-1" style={{ borderTop: `1px solid ${COLORS.primaryXlight}` }}>
                 <Info size={12} className="mt-0.5" style={{ color: COLORS.primary }} />
                 <Text className="text-[11px] leading-relaxed italic" style={{ color: COLORS.muted }}>
                  {skillLevel === 'None' && "Staffs with 'None' skill level will receive 0 automated leads."}
                  {skillLevel === 'Beginner' && "Beginner staff will receive 1 lead at a time."}
                  {skillLevel === 'Intermediate' && "Intermediate staff will receive 2 leads at a time."}
                  {skillLevel === 'Expert' && "Expert staff will receive 3 leads at a time."}
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-5 border-t" style={{ backgroundColor: COLORS.primaryXlight, borderColor: COLORS.primaryXlight }}>
          <button
            onClick={handleInvite}
            disabled={loading}
            className="w-full h-12 rounded-2xl flex items-center justify-center text-white shadow-lg hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            style={{ backgroundColor: COLORS.primaryDark }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <Text weight="bold" size="sm">Sending Invitation...</Text>
              </div>
            ) : (
              <Text weight="bold" size="sm">Send Invitation</Text>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(30px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>
    </div>
  );
}
