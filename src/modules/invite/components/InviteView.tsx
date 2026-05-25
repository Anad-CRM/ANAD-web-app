"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, Users, Zap, Send, CheckCircle } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";
import { api } from "@/core/api/axios";
import { getUser } from "@/core/utils/auth";
import { API_ENDPOINTS } from "@/core/api/api";
import { BackButton } from "@/core/components/ui/BackButton";

const ROLES = ["Manager", "Team Leader", "Staff Member", "Students"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert", "None"];

interface Team {
  id: string | number;
  name: string;
}

interface ApiResponse {
  data?: {
    status?: string;
    message?: string;
    data?: Team[];
  };
}

export function InviteView() {
  const router = useRouter();
  const user = getUser<{ organizationId: string; userName: string; avatar?: string }>();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [teamId, setTeamId] = useState("");
  const [skillLevel, setSkillLevel] = useState("Expert");
  const [batchName, setBatchName] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const needsTeam = role === "Team Leader" || role === "Staff Member";
  const needsSkill = role === "Staff Member";
  const isStudents = role === "Students";

  useEffect(() => {
    if (!user?.organizationId) return;
    api.post(API_ENDPOINTS.TEAM.GET_ALL, { organizationId: user.organizationId })
      .then((r: ApiResponse) => {
        if (r.data?.status === "success") setTeams(r.data.data ?? []);
      })
      .catch(() => {});
  }, [user?.organizationId]);

  const validate = () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    if (!role) { setError("Please select a role"); return false; }
    if (needsTeam && !teamId) { setError("Please select a team"); return false; }
    if (isStudents && !batchName.trim()) { setError("Please enter a batch name"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const body: Record<string, string | undefined> = {
        senderName: user?.userName,
        senderAvatar: user?.avatar,
        organizationId: user?.organizationId,
        receiverEmail: email.toLowerCase().trim(),
        role,
        teamId: teamId || undefined,
        skillLevel: needsSkill ? skillLevel : undefined,
        batchName: isStudents ? batchName.toLowerCase().replace(/\s/g, "") : undefined,
      };
      const res = await api.post(API_ENDPOINTS.INVITATION.SEND, body);
      const data: { status?: string; message?: string } = res.data;
      if (data?.status === "success") {
        setSuccess(true);
      } else {
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
            <CheckCircle size={40} style={{ color: COLORS.primary }} />
          </div>
          <Text as="h1" size="xl" weight="bold" style={{ color: COLORS.text }}>Invitation Sent!</Text>
          <Text style={{ color: COLORS.muted }}>
            An invitation has been sent to <strong>{email}</strong>. They&apos;ll receive an email to join your organization.
          </Text>
          <button
            onClick={() => { setSuccess(false); setEmail(""); setRole(""); setTeamId(""); setBatchName(""); setSkillLevel("Expert"); }}
            className="mt-2 px-8 py-3 rounded-full font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: COLORS.primary }}
          >
            Send Another
          </button>
          <button onClick={() => router.back()} className="text-sm" style={{ color: COLORS.muted }}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 mx-auto max-w-5xl w-full">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <BackButton onClick={() => router.back()} />
        <div>
          <Text as="h1" size="custom" weight="bold" className="text-[26px] md:text-[30px] leading-tight" style={{ color: COLORS.text }}>
            Invite a Friend
          </Text>
          <Text size="custom" className="text-[14px] mt-1" style={{ color: COLORS.muted }}>
            Send an invitation to join your organization
          </Text>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-xl w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: COLORS.text }}>Email Address *</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white" style={{ borderColor: emailError ? "#EF4444" : COLORS.border }}>
              <Mail size={18} style={{ color: COLORS.muted }} />
              <input
                type="email"
                placeholder="Enter member's email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: COLORS.text }}
              />
            </div>
            {emailError && <span className="text-xs text-red-500">{emailError}</span>}
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: COLORS.text }}>Select Role *</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white" style={{ borderColor: COLORS.border }}>
              <User size={18} style={{ color: COLORS.muted }} />
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); setTeamId(""); setError(""); }}
                className="flex-1 appearance-none border-0 outline-none shadow-none text-sm bg-transparent"
                style={{ color: role ? COLORS.text : COLORS.muted, WebkitAppearance: "none", MozAppearance: "none" }}
              >
                <option value="">Select Role</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Batch Name (Students only) */}
          {isStudents && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: COLORS.text }}>Batch Name *</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white" style={{ borderColor: COLORS.border }}>
                <Zap size={18} style={{ color: COLORS.muted }} />
                <input
                  type="text"
                  placeholder="e.g. Jan2025"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  className="flex-1 outline-none text-sm bg-transparent"
                  style={{ color: COLORS.text }}
                />
              </div>
            </div>
          )}

          {/* Team (Team Leader / Staff Member) */}
          {needsTeam && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: COLORS.text }}>Select Team *</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white" style={{ borderColor: COLORS.border }}>
                <Users size={18} style={{ color: COLORS.muted }} />
                <select
                  value={teamId}
                  onChange={(e) => { setTeamId(e.target.value); setError(""); }}
                  className="flex-1 outline-none text-sm bg-transparent"
                  style={{ color: teamId ? COLORS.text : COLORS.muted }}
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => <option key={String(t.id)} value={String(t.id)}>{t.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Skill Level (Staff Member only) */}
          {needsSkill && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: COLORS.text }}>Skill Level</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white" style={{ borderColor: COLORS.border }}>
                <Zap size={18} style={{ color: COLORS.muted }} />
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                  style={{ color: COLORS.text }}
                >
                  {SKILL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Text size="custom" className="text-xs" style={{ color: COLORS.muted }}>
                {skillLevel === "None" ? "Staffs under None skill level will get 0 leads."
                  : skillLevel === "Beginner" ? "Beginner staffs get 1 lead at a time."
                  : skillLevel === "Intermediate" ? "Intermediate staffs get 2 leads at a time."
                  : "Expert staffs get 3 leads at a time."}
              </Text>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white transition hover:opacity-90 disabled:opacity-60 mt-2"
            style={{ backgroundColor: COLORS.primary }}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <><Send size={18} /> Send Invitation</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
