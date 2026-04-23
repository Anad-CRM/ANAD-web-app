"use client";
import React, { useState, useRef, useEffect } from "react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";
import { AvatarCircle } from "@/modules/staffs/components/AvatarCircle";
import {
  Mail, Phone, CalendarDays, ClipboardList, User, MoreHorizontal,
  Globe, Facebook, Instagram, UserPlus, RefreshCw, Check,
} from "lucide-react";
import { Lead, LeadStatus } from "../types/lead.types";
import { getUser } from "@/core/utils/auth";
import { api } from "@/core/api/axios";

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  "New Lead": "#22C55E",
  "Hot Lead": "#3B82F6",
  "Contacted": "#EAB308",
  "Follow Up": "#F97316",
  "RNR": "#A855F7",
  "Switch Off": "#6B7280",
  "Busy": "#EF4444",
  "Not Interested": "#EC4899",
  "Closed": "#6366F1",
  "Register": "#0EA5E9",
  "Enrolled": "#6366F1",
  "Disqualified": "#F59E0B",
  "Customer": "#10B981",
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  "New Lead": ["Hot Lead", "Contacted", "Not Interested", "Follow Up", "RNR", "Register", "Enrolled", "Switch Off", "Busy", "Disqualified"],
  "Contacted": ["Hot Lead", "Follow Up", "Register", "Enrolled", "Not Interested", "RNR", "Switch Off", "Disqualified"],
  "Hot Lead": ["Register", "Enrolled", "Contacted", "Not Interested", "Follow Up", "RNR", "Switch Off", "Disqualified"],
  "Follow Up": ["Contacted", "Hot Lead", "Register", "Enrolled", "Not Interested", "RNR", "Switch Off", "Disqualified"],
  "Register": ["Enrolled", "Follow Up", "Not Interested", "Disqualified"],
  "Enrolled": ["Customer"],
  "Closed": ["New Lead", "Hot Lead"],
  "RNR": ["Follow Up", "Contacted", "Not Interested", "Switch Off", "Disqualified"],
  "Busy": ["Follow Up", "Contacted", "Switch Off", "Disqualified"],
  "Not Interested": ["Switch Off", "Busy", "New Lead", "Disqualified"],
  "Switch Off": ["New Lead", "Hot Lead", "Contacted", "Follow Up", "Not Interested", "Disqualified"],
  "Disqualified": ["New Lead", "Hot Lead", "Contacted", "Follow Up"],
};

const DEFAULT_TRANSITIONS = [
  "New Lead", "Hot Lead", "Contacted", "Follow Up", "RNR", "Switch Off",
  "Busy", "Not Interested", "Register", "Enrolled", "Disqualified",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "?";
  return name.trim().split(" ").filter(Boolean).slice(0, 2)
    .map(p => p[0]).join("").toUpperCase();
}

function safeText(s?: string | null, fallback = ""): string {
  return s?.replace(/[\uD800-\uDFFF]/g, "") || fallback;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch { return dateStr; }
}

/** Wraps text with a yellow mark around the matched keyword. */
function highlight(text: string, keyword: string): React.ReactNode {
  if (!keyword || !text) return text;
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ backgroundColor: "rgba(255,236,0,0.35)", color: "#fff", fontWeight: 700, borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + keyword.length)}
      </mark>
      {text.slice(idx + keyword.length)}
    </>
  );
}

function SourceIcon({ source }: { source?: string }) {
  const s = source?.toLowerCase() ?? "";
  if (s === "facebook") return <Facebook size={13} color="#fff" opacity={0.7} />;
  if (s === "instagram") return <Instagram size={13} color="#fff" opacity={0.7} />;
  if (s === "website") return <Globe size={13} color="#fff" opacity={0.7} />;
  return <ClipboardList size={13} color="#fff" opacity={0.7} />;
}

// ── Confirmation dialog ───────────────────────────────────────────────────────

function ConfirmDialog({
  title, message, onConfirm, onCancel,
}: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ backgroundColor: "rgba(13,27,62,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onCancel}
    >
      <div
        className="w-[290px] rounded-2xl p-5 text-center shadow-2xl"
        style={{ backgroundColor: COLORS.surface }}
        onClick={e => e.stopPropagation()}
      >
        <Text as="p" size="custom" weight="bold" className="text-[15px] mb-1.5" style={{ color: COLORS.text }}>{title}</Text>
        <Text as="p" size="custom" className="text-[12px] leading-relaxed mb-5" style={{ color: COLORS.muted }}>{message}</Text>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-gray-200"
            style={{ backgroundColor: COLORS.grey, color: COLORS.muted }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status dropdown menu ──────────────────────────────────────────────────────

function StatusMenu({ currentStatus, onSelect }: { currentStatus: LeadStatus; onSelect: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const options = STATUS_TRANSITIONS[currentStatus] ?? DEFAULT_TRANSITIONS;

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-full transition-colors hover:bg-white/10"
        title="Change status"
      >
        <MoreHorizontal size={20} color="rgba(255,255,255,0.75)" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 z-[70] rounded-xl overflow-hidden py-1 min-w-[165px]"
          style={{
            backgroundColor: COLORS.surface,
            boxShadow: "0 10px 35px rgba(13,27,62,0.25)",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 text-[12px] font-semibold transition-colors hover:bg-gray-50 flex items-center gap-2.5"
              style={{ color: COLORS.text }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[opt] ?? COLORS.muted }}
              />
              <Text as="span" size="custom" weight="semibold" className="text-[12px]">
                {opt === "Closed" ? "Enrolled" : opt}
              </Text>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LeadCard Props ────────────────────────────────────────────────────────────

export interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  onStatusChange?: (leadId: string, newStatus: string) => void;
  onAssignClick?: (leadId: string) => void;
  isSelected?: boolean;
  searchKeyword?: string;
  showStatusBadge?: boolean;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LeadCard({
  lead,
  onClick,
  onStatusChange,
  onAssignClick,
  isSelected = false,
  searchKeyword = "",
  showStatusBadge = true,
}: LeadCardProps) {
  const userData = getUser<Record<string, string>>();
  const role = userData?.role ?? "";
  const canAssign = ["Admin", "Manager", "Team Leader"].includes(role);

  const [confirm, setConfirm] = useState<{
    title: string; message: string; onConfirm: () => void;
  } | null>(null);

  const name = safeText(lead.userName ?? lead.name, "Unknown Lead");
  const email = safeText(lead.email, "No email provided");
  const mobile = safeText(lead.mobileNumber ?? lead.mobile, "No phone provided");
  const source = safeText(lead.source, "Manual");
  const adName = safeText(lead.ad?.adName ?? lead.campaignName ?? lead.adSet, "");
  const createdAt = formatDate(lead.createdAt);
  const assignedUser = lead.assignedUser;
  const assignedName = safeText(assignedUser?.userName ?? assignedUser?.name ?? lead.assignedTo, "Unassigned");
  const isClosed = lead.status === "Closed" || lead.status === "Enrolled";
  const statusColor = STATUS_COLORS[lead.status] ?? COLORS.primary;
  const statusLabel = lead.status === "Closed" ? "Enrolled"
    : lead.status === "Follow Up" ? "Follow-Up"
      : lead.status;

  async function handleStatusChange(newStatus: string) {
    setConfirm({
      title: "Change Status",
      message: `Are you sure you want to change status to "${newStatus === "Closed" ? "Enrolled" : newStatus}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.post("/lead/update/LeadStatus", { leadId: lead.id, status: newStatus });
          onStatusChange?.(lead.id, newStatus);
        } catch (e) {
          console.error("Status update failed", e);
        }
      },
    });
  }

  return (
    <>
      {/* ── Card shell — keeps original dark-blue design ── */}
      <div
        onClick={onClick}
        className="relative flex items-center p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
        style={{
          backgroundColor: COLORS.primary,
          border: isSelected
            ? `2px solid rgba(255,255,255,0.55)`
            : "1.5px solid transparent",
          boxShadow: isSelected
            ? `0 0 0 3px ${COLORS.primary}60, 0 4px 18px rgba(0,0,0,0.18)`
            : "0 2px 12px rgba(0,0,0,0.1)",
        }}
      >


        {/* ── Selection check overlay ── */}
        {isSelected && (
          <div
            className="absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Check size={12} color="#fff" strokeWidth={3} />
          </div>
        )}

        {/* ── Avatar ── */}
        <div className="mr-4 md:mr-5 flex-shrink-0">
          {assignedUser?.avatar ? (
            <AvatarCircle avatar={assignedUser.avatar} size={64} />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-bold"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
                border: "1.5px solid rgba(255,255,255,0.2)",
              }}
            >
              {getInitials(name)}
            </div>
          )}
        </div>

        {/* ── Content columns ── */}
        <div className="flex flex-1 flex-col md:flex-row md:items-start justify-between min-w-0 gap-2">

          {/* Left column */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-2">
            {/* Name + status badge */}
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <Text as="h3" size="custom" weight="bold" className="text-white text-[14px] truncate leading-tight">
                {searchKeyword ? highlight(name, searchKeyword) : name}
              </Text>
              {showStatusBadge && (
                <Text
                  as="span"
                  size="custom"
                  weight="bold"
                  className="text-[8.5px] px-1.5 py-0.5 rounded-[4px] flex-shrink-0"
                  style={{
                    backgroundColor: `${statusColor}30`,
                    color: statusColor,
                    border: `1px solid ${statusColor}60`,
                  }}
                >
                  {statusLabel}
                </Text>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-white truncate">
              <Mail size={13} className="flex-shrink-0" />
              <Text as="span" size="custom" weight="medium" className="text-[11px] truncate">
                {searchKeyword ? highlight(email, searchKeyword) : email}
              </Text>
            </div>

            <div className="flex items-center gap-1.5 text-white truncate">
              <Phone size={13} className="flex-shrink-0" />
              <Text as="span" size="custom" weight="medium" className="text-[11px] truncate">
                {searchKeyword ? highlight(mobile, searchKeyword) : mobile}
              </Text>
            </div>

            {/* Ad / campaign */}
            {adName && (
              <div className="flex items-center gap-1.5 text-white truncate">
                <User size={13} className="flex-shrink-0" />
                <Text as="span" size="custom" weight="medium" className="text-[11px] truncate">
                  {adName}
                </Text>
              </div>
            )}

            {createdAt && (
              <div className="flex items-center gap-1.5 text-white/60">
                <CalendarDays size={12} className="flex-shrink-0" />
                <Text as="span" size="custom" weight="medium" className="text-[10px]">
                  Created {createdAt}
                </Text>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="md:min-w-[160px] shrink-0 md:mt-11 md:ml-10 self-start">
            <div
              className="flex flex-col gap-1.5 pl-0 md:pl-4 md:border-l"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              {/* Assigned staff */}
              <div className="flex items-center gap-1.5 text-white/75 truncate">
                {assignedUser ? (
                  <AvatarCircle avatar={assignedUser.avatar} size={16} />
                ) : (
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                  />
                )}
                <Text as="span" size="custom" weight="semibold" className="text-[11px] truncate">
                  {assignedName}
                </Text>
              </div>

              {/* Source */}
              <div className="flex items-center gap-1.5 text-white/75 truncate">
                <SourceIcon source={source} />
                <Text as="span" size="custom" weight="medium" className="text-[11px] truncate capitalize">
                  {source}
                </Text>
              </div>

              {/* ── Recaptured badge ── */}
              {lead.isDuplicated && (
                <div className="flex items-center gap-1.5 text-white/75 truncate">
                  <RefreshCw size={13} />

                  <Text as="span" size="custom" weight="medium" className="text-[11px] truncate capitalize">
                    Recaptured
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Top-right actions ── */}
        <div
          className="absolute top-3 right-3 flex items-center gap-0.5"
          onClick={e => e.stopPropagation()}
        >
          {/* Assign button — admin/manager/team leader only */}
          {canAssign && !isClosed && (
            <button
              onClick={() => onAssignClick?.(lead.id)}
              className="p-1.5 rounded-full transition-colors hover:bg-white/10"
              title="Assign to staff"
            >
              <UserPlus size={17} color="rgba(255,255,255,0.75)" />
            </button>
          )}

          {/* Status change menu */}
          {!isClosed && (
            <StatusMenu currentStatus={lead.status} onSelect={handleStatusChange} />
          )}
        </div>
      </div>

      {/* ── Confirm dialog ── */}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
