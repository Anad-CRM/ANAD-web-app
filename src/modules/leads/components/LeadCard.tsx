"use client";
import React, { useState } from "react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";
import { AvatarCircle } from "@/modules/staffs/components/AvatarCircle";
import {
  Mail, Phone, CalendarDays, ClipboardList, User, MoreHorizontal,
  Globe, Facebook, Instagram, UserPlus, RefreshCw, Check, X
} from "lucide-react";
import { Lead, LeadStatus } from "../types/lead.types";
import { getUser } from "@/core/utils/auth";
import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { ConfirmDialog } from "@/core/components/ui/ConfirmDialog";
import { STATUS_COLORS, STATUS_TRANSITIONS, DEFAULT_TRANSITIONS } from "../constants/leadConstants";

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

// ── Status Modal (Replaces Dropdown) ──────────────────────────────────────────

function StatusModal({ currentStatus, onSelect, onClose }: { currentStatus: LeadStatus; onSelect: (s: string) => void, onClose: () => void }) {
  const options = STATUS_TRANSITIONS[currentStatus] ?? DEFAULT_TRANSITIONS;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: "rgba(13,27,62,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: COLORS.surface }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <Text as="h3" size="custom" weight="bold" className="text-[17px]" style={{ color: COLORS.text }}>
            Update Status
          </Text>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <X size={16} style={{ color: COLORS.subtle }} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
          {options.map(opt => {
            const color = STATUS_COLORS[opt] ?? COLORS.muted;
            return (
              <button
                key={opt}
                onClick={() => { onSelect(opt); onClose(); }}
                className="w-full text-left px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-2.5 border border-gray-100 shadow-sm hover:shadow-md"
                style={{ backgroundColor: "white", color: COLORS.text, borderColor: `${color}40` }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                />
                <Text className="truncate" style={{ fontSize: '13px' }}>{opt === "Closed" ? "Enrolled" : opt}</Text>
              </button>
            );
          })}
        </div>
      </div>
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

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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
          await api.post(API_ENDPOINTS.LEADS.UPDATE_STATUS, { leadId: lead.id, status: newStatus });
          onStatusChange?.(lead.id, newStatus);
        } catch (e) {
          console.error("Status update failed", e);
        }
      },
    });
  }

  return (
    <>

      <div
        onClick={onClick}
        className="relative flex items-center p-4 md:p-5 rounded-[20px] transition-all duration-300 cursor-pointer overflow-hidden group"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
          border: isSelected
            ? `2px solid #ffffff`
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isSelected
            ? `0 0 0 3px ${COLORS.primary}60, 0 12px 30px rgba(13,27,62,0.3)`
            : "0 6px 18px rgba(13,27,62,0.15)",
          transform: "translateY(0)",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(13,27,62,0.25)";
            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(13,27,62,0.15)";
            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
          }
        }}
      >
        {/* Subtle glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* ── Selection check overlay ── */}
        {isSelected && (
          <div
            className="absolute top-3 left-3 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "#22C55E" }}
          >
            <Check size={13} color="#fff" strokeWidth={3} />
          </div>
        )}

        {/* ── Avatar ── */}
        <div className="mr-4 md:mr-5 flex-shrink-0 relative z-10">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-[22px] font-bold shadow-inner"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              color: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(5px)"
            }}
          >
            {getInitials(name)}
          </div>

        </div>

        {/* ── Content columns ── */}
        <div className="flex flex-1 flex-col md:flex-row md:items-start justify-between min-w-0 gap-3 relative z-10">

          {/* Left column */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-2">
            {/* Name + status badge */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Text as="h3" size="custom" weight="bold" className="text-white text-[15px] truncate leading-tight tracking-wide">
                {searchKeyword ? highlight(name, searchKeyword) : name}
              </Text>
              {showStatusBadge && (
                <div
                  className="px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: `1px solid ${statusColor}50`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
                  <Text weight="bold" className="text-[9px] uppercase tracking-wider" style={{ color: statusColor }}>
                    {statusLabel}
                  </Text>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-white/90 truncate group-hover:text-white transition-colors">
              <div className="p-1 rounded-md bg-white/10"><Mail size={12} /></div>
              <Text weight="medium" style={{ fontSize: '11.5px' }} className="truncate">
                {searchKeyword ? highlight(email, searchKeyword) : email}
              </Text>
            </div>

            <div className="flex items-center gap-2 text-white/90 truncate group-hover:text-white transition-colors">
              <div className="p-1 rounded-md bg-white/10"><Phone size={12} /></div>
              <Text weight="medium" style={{ fontSize: '11.5px' }} className="truncate">
                {searchKeyword ? highlight(mobile, searchKeyword) : mobile}
              </Text>
            </div>

            {/* Ad / campaign */}
            {adName && (
              <div className="flex items-center gap-2 text-white/90 truncate group-hover:text-white transition-colors">
                <div className="p-1 rounded-md bg-white/10"><User size={12} /></div>
                <Text weight="medium" style={{ fontSize: '11.5px' }} className="truncate">
                  {adName}
                </Text>
              </div>
            )}

            {createdAt && (
              <div className="flex items-center gap-2 text-white/60 mt-1">
                <CalendarDays size={12} className="flex-shrink-0" />
                <Text weight="medium" className="tracking-wide" style={{ fontSize: '10px' }}>
                  CREATED {createdAt}
                </Text>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="md:min-w-[160px] shrink-0 md:mt-8 md:ml-6 self-start">
            <div
              className="flex flex-col gap-2 pl-0 md:pl-4 md:border-l"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            >
              {/* Assigned staff */}
              <div className="flex items-center gap-2 text-white/80 truncate bg-black/10 px-2 py-1.5 rounded-lg">
                {assignedUser ? (
                  <AvatarCircle avatar={assignedUser.avatar} size={18} />
                ) : (
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center bg-white/20"
                  >
                    <User size={10} color="#fff" />
                  </span>
                )}
                <Text weight="semibold" className="truncate" style={{ fontSize: '11px' }}>
                  {assignedName}
                </Text>
              </div>

              {/* Source */}
              <div className="flex items-center gap-2 text-white/80 truncate px-2">
                <SourceIcon source={source} />
                <Text weight="medium" className="truncate capitalize" style={{ fontSize: '11px' }}>
                  {source}
                </Text>
              </div>

              {/* ── Recaptured badge ── */}
              {lead.isDuplicated && (
                <div className="flex items-center gap-2 text-orange-300 truncate px-2">
                  <RefreshCw size={12} />
                  <Text weight="semibold" className="truncate uppercase tracking-wider" style={{ fontSize: '11px' }}>
                    Recaptured
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Top-right actions ── */}
        <div
          className="absolute top-4 right-4 flex items-center gap-1.5 z-20"
          onClick={e => e.stopPropagation()}
        >
          {/* Assign button */}
          {canAssign && !isClosed && (
            <button
              onClick={() => onAssignClick?.(lead.id)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/20 transition-all shadow-sm backdrop-blur-sm group/btn"
              title="Assign to staff"
            >
              <UserPlus size={16} className="text-white/80 group-hover/btn:text-white" />
            </button>
          )}

          {/* Status change modal trigger */}
          {!isClosed && (
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/20 transition-all shadow-sm backdrop-blur-sm group/btn"
              title="Change status"
            >
              <MoreHorizontal size={16} className="text-white/80 group-hover/btn:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* ── Status Modal ── */}
      {isStatusModalOpen && (
        <StatusModal
          currentStatus={lead.status}
          onSelect={handleStatusChange}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}

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
