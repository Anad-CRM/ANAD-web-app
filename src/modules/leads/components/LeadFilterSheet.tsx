"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronDown, ChevronUp, Check, SlidersHorizontal } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

// ── Types ──────────────────────────────────────────────────────────────────

export interface FilterState {
  statuses: string[];
  staffIds: string[];
  datePreset: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface LeadFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onClearAll: () => void;
  staffMembers?: StaffMember[];
  lockedStatus?: string | null;
}

interface StaffMember {
  id: string;
  userName: string;
  profilePicture?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  "New Lead", "Hot Lead", "Contacted", "Closed",
  "Register", "RNR", "Not Interested", "Follow Up",
  "Busy", "Switch Off", "Disqualified"
];

const DATE_PRESETS = [
  "Today", "Yesterday", "This Week", "This Month", "Last Month", "Custom"
];

// Status → accent color mapping (mirrors Flutter theme)
const STATUS_COLORS: Record<string, string> = {
  "New Lead":      COLORS.primary,
  "Hot Lead":      "#E85D04",
  "Contacted":     "#0077B6",
  "Closed":        COLORS.success,
  "Register":      "#7B2FBE",
  "RNR":           COLORS.warning,
  "Not Interested":"#9B2226",
  "Follow Up":     "#0096C7",
  "Busy":          "#CA6702",
  "Switch Off":    COLORS.muted,
  "Disqualified":  "#6B6B6B",
};

// ── Helper: compute date range from preset ─────────────────────────────────

function rangeForPreset(preset: string): { startDate: string; endDate: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (preset) {
    case "Today":
      return { startDate: fmt(today), endDate: fmt(todayEnd) };
    case "Yesterday": {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      const yEnd = new Date(y); yEnd.setHours(23, 59, 59);
      return { startDate: fmt(y), endDate: fmt(yEnd) };
    }
    case "This Week": {
      const w = new Date(today); w.setDate(w.getDate() - 7);
      return { startDate: fmt(w), endDate: fmt(todayEnd) };
    }
    case "This Month": {
      const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const mEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { startDate: fmt(mStart), endDate: fmt(mEnd) };
    }
    case "Last Month": {
      const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { startDate: fmt(lmStart), endDate: fmt(lmEnd) };
    }
    default:
      return { startDate: fmt(today), endDate: fmt(todayEnd) };
  }
}

// ── Sub-component: Section Toggle ──────────────────────────────────────────

function Section({
  title, count, children, defaultOpen = false
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold" style={{ color: COLORS.text }}>
            {title}
          </span>
          {count != null && count > 0 && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
            >
              {count}
            </span>
          )}
        </div>
        <span style={{ color: open ? COLORS.primary : COLORS.muted }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && <div className="pb-3">{children}</div>}
      <div className="h-px" style={{ backgroundColor: COLORS.border }} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function LeadFilterSheet({
  isOpen,
  onClose,
  initialFilters,
  onApply,
  onClearAll,
  staffMembers = [],
  lockedStatus = null,
}: LeadFilterSheetProps) {
  const [tempStatuses, setTempStatuses] = useState<string[]>([]);
  const [tempStaffIds, setTempStaffIds] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync temp state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTempStatuses(initialFilters.statuses);
      setTempStaffIds(initialFilters.staffIds);
      setDatePreset(initialFilters.datePreset);
      setCustomStart(initialFilters.startDate ?? "");
      setCustomEnd(initialFilters.endDate ?? "");
    }
  }, [isOpen, initialFilters]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function toggleStatus(s: string) {
    if (lockedStatus) return;
    setTempStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  function toggleStaff(id: string) {
    setTempStaffIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function applyPreset(preset: string) {
    if (preset === datePreset) {
      setDatePreset(null);
      setCustomStart("");
      setCustomEnd("");
    } else {
      setDatePreset(preset);
      if (preset !== "Custom") {
        const { startDate, endDate } = rangeForPreset(preset);
        setCustomStart(startDate);
        setCustomEnd(endDate);
      }
    }
  }

  function handleApply() {
    // At least one filter required
    const hasFilter =
      tempStatuses.length > 0 ||
      tempStaffIds.length > 0 ||
      datePreset != null;
    if (!hasFilter) return;

    let start: string | null = null;
    let end: string | null = null;
    if (datePreset === "Custom") {
      start = customStart || null;
      end   = customEnd || null;
    } else if (datePreset) {
      const r = rangeForPreset(datePreset);
      start = r.startDate;
      end   = r.endDate;
    }

    onApply({
      statuses:   lockedStatus ? [lockedStatus] : tempStatuses,
      staffIds:   tempStaffIds,
      datePreset,
      startDate:  start,
      endDate:    end,
    });
    onClose();
  }

  function handleClear() {
    setTempStatuses([]);
    setTempStaffIds([]);
    setDatePreset(null);
    setCustomStart("");
    setCustomEnd("");
    onClearAll();
    onClose();
  }

  const activeCount =
    (lockedStatus ? 0 : tempStatuses.length) +
    tempStaffIds.length +
    (datePreset ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(13,27,62,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-md rounded-t-[28px] sm:rounded-[24px] overflow-hidden flex flex-col"
        style={{
          backgroundColor: COLORS.surface,
          maxHeight: "90vh",
          boxShadow: "0 -8px 40px rgba(13,27,62,0.18)",
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: COLORS.border }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} style={{ color: COLORS.primary }} />
            <h2 className="text-[18px] font-bold" style={{ color: COLORS.text }}>
              Filter Options
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-gray-100"
          >
            <X size={20} style={{ color: COLORS.muted }} />
          </button>
        </div>

        {/* Active filter summary */}
        <div className="px-6 pb-2">
          <p
            className="text-[13px] font-semibold text-center"
            style={{ color: activeCount > 0 ? COLORS.danger : COLORS.subtle }}
          >
            {activeCount > 0
              ? `${activeCount} filter${activeCount > 1 ? "s" : ""} active`
              : "No filters currently active"}
          </p>
        </div>
        <div className="h-px mx-6" style={{ backgroundColor: COLORS.border }} />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">

          {/* ── Date Range ── */}
          <Section title="Date Range" count={datePreset ? 1 : 0} defaultOpen={true}>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {DATE_PRESETS.map(preset => {
                const isActive = datePreset === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center justify-center gap-1 py-2 px-1 rounded-full text-[11px] font-semibold transition-all"
                    style={{
                      backgroundColor: isActive ? COLORS.primary : COLORS.primaryXlight,
                      color: isActive ? "#fff" : COLORS.text,
                      border: `1.5px solid ${isActive ? COLORS.primary : COLORS.border}`,
                    }}
                  >
                    {isActive && <Check size={10} />}
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Custom date inputs */}
            {datePreset === "Custom" && (
              <div className="mt-3 flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: COLORS.muted }}>
                    From
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    max={customEnd || undefined}
                    onChange={e => setCustomStart(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-[13px] border outline-none focus:ring-1"
                    style={{ borderColor: COLORS.border, color: COLORS.text, outlineColor: COLORS.primary }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: COLORS.muted }}>
                    To
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    min={customStart || undefined}
                    onChange={e => setCustomEnd(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-[13px] border outline-none focus:ring-1"
                    style={{ borderColor: COLORS.border, color: COLORS.text, outlineColor: COLORS.primary }}
                  />
                </div>
              </div>
            )}

            {/* Selected date display */}
            {datePreset && datePreset !== "Custom" && (
              <div
                className="mt-3 flex items-center gap-2 p-3 rounded-xl"
                style={{ backgroundColor: COLORS.primaryXlight, border: `1px solid ${COLORS.primaryLight}` }}
              >
                <Calendar size={15} style={{ color: COLORS.primary }} />
                <span className="text-[12px] font-semibold" style={{ color: COLORS.primary }}>
                  {(() => {
                    const r = rangeForPreset(datePreset);
                    return `${r.startDate} – ${r.endDate}`;
                  })()}
                </span>
              </div>
            )}
          </Section>

          {/* ── Status ── */}
          <Section
            title={lockedStatus ? `Status: ${lockedStatus}` : "Status"}
            count={lockedStatus ? 0 : tempStatuses.length}
            defaultOpen={!lockedStatus}
          >
            {lockedStatus ? (
              <p className="text-[12px] mt-1" style={{ color: COLORS.muted }}>
                Status is locked for this view.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {STATUS_OPTIONS.map(s => {
                  const isActive = tempStatuses.includes(s);
                  const color = STATUS_COLORS[s] ?? COLORS.primary;
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[12px] font-semibold transition-all"
                      style={{
                        backgroundColor: isActive ? color : `${color}18`,
                        color: isActive ? "#fff" : color,
                        border: `1.5px solid ${isActive ? color : `${color}40`}`,
                      }}
                    >
                      {isActive && <Check size={10} />}
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          {/* ── Staff Members (if available) ── */}
          {staffMembers.length > 0 && (
            <Section title="Staff Members" count={tempStaffIds.length}>
              <div className="flex flex-col gap-1 mt-1 max-h-48 overflow-y-auto custom-scrollbar">
                {staffMembers.map(staff => {
                  const isActive = tempStaffIds.includes(staff.id);
                  return (
                    <button
                      key={staff.id}
                      onClick={() => toggleStaff(staff.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: isActive ? COLORS.primaryXlight : "transparent",
                        border: `1.5px solid ${isActive ? COLORS.primary : "transparent"}`,
                      }}
                    >
                      {/* Avatar placeholder */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                      >
                        {staff.userName?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <span className="flex-1 text-[13px] font-medium truncate" style={{ color: COLORS.text }}>
                        {staff.userName}
                      </span>
                      {isActive && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: COLORS.primary }}
                        >
                          <Check size={12} color="#fff" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          <div className="h-4" />
        </div>

        {/* Footer buttons */}
        <div
          className="px-6 py-4 flex gap-3"
          style={{ borderTop: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface }}
        >
          <button
            onClick={handleClear}
            className="flex-1 py-3 rounded-xl text-[14px] font-bold transition-all hover:bg-gray-100"
            style={{
              backgroundColor: COLORS.grey,
              color: COLORS.muted,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              boxShadow: `0 4px 14px ${COLORS.primary}50`,
            }}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
