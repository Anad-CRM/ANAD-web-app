"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronDown, ChevronUp, Check, SlidersHorizontal } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

// ── Types ──────────────────────────────────────────────────────────────────

export interface FilterState {
  statuses: string[];
  staffIds: string[];
  datePreset: string | null;
  startDate: string | null;
  endDate: string | null;
  teamIds: string[];
  adIds: string[];
}

interface LeadFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onClearAll: () => void;
  staffMembers?: { id: string; userName: string }[];
  teams?: { id: string; name: string }[];
  ads?: { id: string; adName: string; platform?: string }[];
  lockedStatus?: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  "New Lead", "Hot Lead", "Contacted", "Closed",
  "Register", "RNR", "Not Interested", "Follow Up",
  "Busy", "Switch Off", "Disqualified",
];

const DATE_PRESETS = [
  "Today", "Yesterday", "This Week", "This Month", "Last Month", "Custom",
];

// ── Helpers ─────────────────────────────────────────────────────────────────

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
      const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { startDate: fmt(mStart), endDate: fmt(mEnd) };
    }
    case "Last Month": {
      const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { startDate: fmt(lmStart), endDate: fmt(lmEnd) };
    }
    default:
      return { startDate: fmt(today), endDate: fmt(todayEnd) };
  }
}

// ── Selected chips preview (shown when section is collapsed) ───────────────

function SelectedChips({ labels }: { labels: string[] }) {
  if (!labels.length) return null;
  const maxShow = 4;
  const shown = labels.slice(0, maxShow);
  const extra = labels.length - maxShow;
  return (
    <div className="flex flex-wrap gap-2 pb-3">
      {shown.map(label => (
        <span
          key={label}
          className="px-2.5 py-1.5 rounded-full truncate max-w-[90px]"
          style={{
            backgroundColor: COLORS.primaryXlight,
            color: COLORS.primary,
            border: `1px solid ${COLORS.primaryLight}`,
          }}
        >
          <Text weight="semibold" style={{ fontSize: '10px' }}>{label}</Text>
        </span>
      ))}
      {extra > 0 && (
        <span
          className="px-2.5 py-1.5 rounded-full"
          style={{
            backgroundColor: COLORS.primaryXlight,
            color: COLORS.primary,
            border: `1px solid ${COLORS.primaryLight}`,
          }}
        >
          <Text weight="semibold" style={{ fontSize: '10px' }}>+{extra} more</Text>
        </span>
      )}
    </div>
  );
}

// ── Section header (accordion row) ────────────────────────────────────────

function SectionRow({
  title, count, isExpanded, onToggle,
}: {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3"
    >
      <div className="flex items-center gap-2">
        <Text weight="semibold" style={{ color: COLORS.text, fontSize: '15px' }}>
          {title}
        </Text>
        {count > 0 && (
          <span
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
          >
            <Text weight="bold" style={{ fontSize: '11px' }}>{count}</Text>
          </span>
        )}
      </div>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: isExpanded ? COLORS.primaryXlight : "#f3f4f6",
        }}
      >
        {isExpanded
          ? <ChevronUp size={16} style={{ color: COLORS.primary }} />
          : <ChevronDown size={16} style={{ color: "#9ca3af" }} />
        }
      </div>
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

type SectionKey = "date" | "status" | "staff" | "ads" | null;

export function LeadFilterSheet({
  isOpen,
  onClose,
  initialFilters,
  onApply,
  onClearAll,
  staffMembers = [],
  ads = [],
  lockedStatus = null,
}: LeadFilterSheetProps) {
  const [tempStatuses, setTempStatuses] = useState<string[]>([]);
  const [tempStaffIds, setTempStaffIds] = useState<string[]>([]);
  const [tempAdIds, setTempAdIds] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [adSearch, setAdSearch] = useState<string>("");

  // Only one section expanded at a time — matches Flutter's _expandedType
  const [expandedKey, setExpandedKey] = useState<SectionKey>("date");

  const overlayRef = useRef<HTMLDivElement>(null);

  function toggleSection(key: SectionKey) {
    setExpandedKey(prev => (prev === key ? null : key));
  }

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        setTempStatuses(initialFilters.statuses);
        setTempStaffIds(initialFilters.staffIds);
        setTempAdIds(initialFilters.adIds ?? []);
        setDatePreset(initialFilters.datePreset);
        setCustomStart(initialFilters.startDate ?? "");
        setCustomEnd(initialFilters.endDate ?? "");
        setStaffSearch("");
        setAdSearch("");
        setExpandedKey("date");
      });
    }
  }, [isOpen, initialFilters]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function toggleStatus(s: string) {
    if (lockedStatus) return;
    setTempStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function toggleStaff(id: string) {
    setTempStaffIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleAd(id: string) {
    setTempAdIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
      } else {
        setCustomStart("");
        setCustomEnd("");
      }
    }
  }

  function handleApply() {
    let start: string | null = null;
    let end: string | null = null;
    if (datePreset === "Custom") {
      start = customStart || null;
      end = customEnd || null;
    } else if (datePreset) {
      const r = rangeForPreset(datePreset);
      start = r.startDate;
      end = r.endDate;
    }

    onApply({
      statuses: lockedStatus ? [lockedStatus] : tempStatuses,
      staffIds: tempStaffIds,
      teamIds: [],
      adIds: tempAdIds,
      datePreset,
      startDate: start,
      endDate: end,
    });
    onClose();
  }

  function handleClear() {
    setTempStatuses([]);
    setTempStaffIds([]);
    setTempAdIds([]);
    setDatePreset(null);
    setCustomStart("");
    setCustomEnd("");
    setStaffSearch("");
    setAdSearch("");
    onClearAll();
    onClose();
  }

  // Summary count for header
  let summaryCount = 0;
  const summaryParts: string[] = [];
  if (tempStatuses.length) { summaryCount++; summaryParts.push(`${tempStatuses.length} status`); }
  if (tempStaffIds.length) { summaryCount++; summaryParts.push(`${tempStaffIds.length} staff`); }
  if (tempAdIds.length) { summaryCount++; summaryParts.push(`${tempAdIds.length} ad${tempAdIds.length > 1 ? "s" : ""}`); }
  if (datePreset) { summaryCount++; summaryParts.push("date range"); }

  // Staff name lookup for collapsed chips
  const selectedStaffLabels = tempStaffIds.map(id => {
    const found = staffMembers.find(s => s.id === id);
    return found?.userName ?? id;
  });
  const selectedAdLabels = tempAdIds.map(id => {
    const found = ads.find(a => a.id === id);
    return found?.adName ?? id;
  });
  const dateLabel = datePreset
    ? (datePreset === "Custom"
        ? (customStart && customEnd ? `${customStart} – ${customEnd}` : "Custom")
        : datePreset)
    : null;

  const filteredStaff = staffMembers.filter(s =>
    s.userName?.toLowerCase().startsWith(staffSearch.toLowerCase())
  );
  const filteredAds = ads.filter(a =>
    a.adName?.toLowerCase().startsWith(adSearch.toLowerCase()) ||
    a.platform?.toLowerCase().startsWith(adSearch.toLowerCase())
  );

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
          backgroundColor: "#fff",
          maxHeight: "92vh",
          boxShadow: "0 -8px 40px rgba(13,27,62,0.18)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} style={{ color: COLORS.primary }} />
            <Text weight="bold" style={{ color: "#1a1a1a", fontSize: '20px' }}>
              Filter Options
            </Text>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={18} color="#555" />
          </button>
        </div>

        {/* Summary line */}
        <div className="px-6 pt-2 pb-3">
          <Text
            weight="bold"
            className="text-center"
            style={{ color: summaryCount > 0 ? "#c0392b" : "#9ca3af", fontSize: '14px' }}
          >
            {summaryCount > 0
              ? `${summaryCount} filter${summaryCount > 1 ? "s" : ""} active: ${summaryParts.join(", ")}`
              : "No filters currently active"}
          </Text>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">

          {/* ────────── DATE RANGE ────────── */}
          <div className="h-px bg-gray-200 mb-1" />
          <SectionRow
            title="Date Range"
            count={datePreset ? 1 : 0}
            isExpanded={expandedKey === "date"}
            onToggle={() => toggleSection("date")}
          />

          {/* Collapsed preview */}
          {expandedKey !== "date" && dateLabel && (
            <div className="flex flex-wrap gap-2 pb-3">
              <span
                className="px-2.5 py-1.5 rounded-full"
                style={{
                  backgroundColor: COLORS.primaryXlight,
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.primaryLight}`,
                }}
              >
                <Text weight="semibold" style={{ fontSize: '10px' }}>{dateLabel}</Text>
              </span>
            </div>
          )}

          {/* Expanded content */}
          {expandedKey === "date" && (
            <div className="pb-4">
              {/* Preset chips — 4 in row 1, 2 in row 2 (like Flutter) */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {DATE_PRESETS.slice(0, 4).map(preset => {
                  const isActive = datePreset === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => applyPreset(preset)}
                      className="flex items-center justify-center gap-1 py-2 rounded-full text-[11px] font-semibold transition-all"
                      style={{
                        backgroundColor: isActive ? COLORS.primary : "#fff",
                        color: isActive ? "#fff" : "#1a1a1a",
                        border: `1.5px solid ${isActive ? COLORS.primary : "#d1d5db"}`,
                      }}
                    >
                      {isActive && <Check size={9} />}
                      {preset}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                {DATE_PRESETS.slice(4).map(preset => {
                  const isActive = datePreset === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => applyPreset(preset)}
                      className="flex items-center justify-center gap-1 py-2 px-4 rounded-full text-[11px] font-semibold transition-all"
                      style={{
                        backgroundColor: isActive ? COLORS.primary : "#fff",
                        color: isActive ? "#fff" : "#1a1a1a",
                        border: `1.5px solid ${isActive ? COLORS.primary : "#d1d5db"}`,
                      }}
                    >
                      {isActive && <Check size={9} />}
                      {preset}
                    </button>
                  );
                })}
              </div>

              {/* Selected date box */}
              {datePreset && datePreset !== "Custom" && (
                <div
                  className="mt-3 flex items-center gap-2 p-3 rounded-xl"
                  style={{
                    backgroundColor: COLORS.primaryXlight,
                    border: `1px solid ${COLORS.primaryLight}`,
                  }}
                >
                  <Calendar size={15} style={{ color: COLORS.primary }} />
                  <Text weight="semibold" style={{ color: COLORS.primary, fontSize: '12px' }}>
                    {(() => {
                      const r = rangeForPreset(datePreset);
                      return `${r.startDate} – ${r.endDate}`;
                    })()}
                  </Text>
                </div>
              )}

              {/* Custom date inputs */}
              {datePreset === "Custom" && (
                <div className="mt-3 flex gap-2">
                  <div className="flex-1">
                    <Text weight="medium" className="mb-1 block text-gray-500" style={{ fontSize: '11px' }}>From</Text>
                    <input
                      type="date"
                      value={customStart}
                      max={customEnd || undefined}
                      onChange={e => setCustomStart(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-[13px] border outline-none focus:ring-1"
                      style={{ borderColor: "#d1d5db", color: COLORS.text, outlineColor: COLORS.primary }}
                    />
                  </div>
                  <div className="flex-1">
                    <Text weight="medium" className="mb-1 block text-gray-500" style={{ fontSize: '11px' }}>To</Text>
                    <input
                      type="date"
                      value={customEnd}
                      min={customStart || undefined}
                      onChange={e => setCustomEnd(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-[13px] border outline-none focus:ring-1"
                      style={{ borderColor: "#d1d5db", color: COLORS.text, outlineColor: COLORS.primary }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────── STATUS ────────── */}
          <div className="h-px bg-gray-200 mb-1" />
          <SectionRow
            title={lockedStatus ? `Status: ${lockedStatus}` : "Status"}
            count={lockedStatus ? 0 : tempStatuses.length}
            isExpanded={expandedKey === "status"}
            onToggle={() => toggleSection("status")}
          />

          {/* Collapsed preview */}
          {expandedKey !== "status" && !lockedStatus && tempStatuses.length > 0 && (
            <SelectedChips labels={tempStatuses} />
          )}

          {/* Expanded content */}
          {expandedKey === "status" && (
            <div className="pb-4">
              {lockedStatus ? (
                <Text style={{ color: COLORS.muted, fontSize: '12px' }}>
                  Status is locked for this view.
                </Text>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => {
                    const isActive = tempStatuses.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[12px] font-semibold transition-all"
                        style={{
                          backgroundColor: isActive ? COLORS.primary : "#fff",
                          color: isActive ? "#fff" : COLORS.primary,
                          border: `1.5px solid ${isActive ? COLORS.primary : COLORS.primaryLight}`,
                        }}
                      >
                        {isActive && <Check size={10} />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ────────── STAFF MEMBERS ────────── */}
          <div className="h-px bg-gray-200 mb-1" />
          <SectionRow
            title="Staff Members"
            count={tempStaffIds.length}
            isExpanded={expandedKey === "staff"}
            onToggle={() => toggleSection("staff")}
          />

          {/* Collapsed preview */}
          {expandedKey !== "staff" && selectedStaffLabels.length > 0 && (
            <SelectedChips labels={selectedStaffLabels} />
          )}

          {/* Expanded content */}
          {expandedKey === "staff" && (
            <div className="pb-4">
              <input
                type="text"
                placeholder="Search staff..."
                value={staffSearch}
                onChange={e => setStaffSearch(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-[13px] border outline-none focus:ring-1 transition-all mb-2"
                style={{ borderColor: "#d1d5db", color: COLORS.text, outlineColor: COLORS.primary }}
              />
              <div className="flex flex-col gap-1 max-h-52 overflow-y-auto custom-scrollbar">
                {staffMembers.length === 0 ? (
                  <Text className="text-center py-4 text-gray-400" style={{ fontSize: '12px' }}>No staff members found</Text>
                ) : filteredStaff.length === 0 ? (
                  <Text className="text-center py-4 text-gray-400" style={{ fontSize: '12px' }}>No results for &quot;{staffSearch}&quot;</Text>
                ) : (
                  filteredStaff.map(staff => {
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
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                        >
                          {staff.userName?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <Text weight="medium" className="flex-1 truncate" style={{ color: "#1a1a1a", fontSize: '13px' }}>
                          {staff.userName}
                        </Text>
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
                  })
                )}
              </div>
            </div>
          )}

          {/* ────────── ADS SOURCE ────────── */}
          {ads.length > 0 && (
            <>
              <div className="h-px bg-gray-200 mb-1" />
              <SectionRow
                title="Ads Source"
                count={tempAdIds.length}
                isExpanded={expandedKey === "ads"}
                onToggle={() => toggleSection("ads")}
              />

              {/* Collapsed preview */}
              {expandedKey !== "ads" && selectedAdLabels.length > 0 && (
                <SelectedChips labels={selectedAdLabels} />
              )}

              {/* Expanded content */}
              {expandedKey === "ads" && (
                <div className="pb-4">
                  <input
                    type="text"
                    placeholder="Search ads..."
                    value={adSearch}
                    onChange={e => setAdSearch(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-[13px] border outline-none focus:ring-1 transition-all mb-2"
                    style={{ borderColor: "#d1d5db", color: COLORS.text, outlineColor: COLORS.primary }}
                  />
                  <div className="flex flex-col gap-1 max-h-52 overflow-y-auto custom-scrollbar">
                    {filteredAds.length === 0 ? (
                      <Text className="text-center py-4 text-gray-400" style={{ fontSize: '12px' }}>
                        {adSearch ? `No results for "${adSearch}"` : "No ads found"}
                      </Text>
                    ) : (
                      filteredAds.map(ad => {
                        const isActive = tempAdIds.includes(ad.id);
                        return (
                          <button
                            key={ad.id}
                            onClick={() => toggleAd(ad.id)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                            style={{
                              backgroundColor: isActive ? COLORS.primaryXlight : "transparent",
                              border: `1.5px solid ${isActive ? COLORS.primary : "transparent"}`,
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                            >
                              {ad.platform?.charAt(0)?.toUpperCase() ?? "A"}
                            </div>
                            <Text weight="medium" className="flex-1 truncate" style={{ color: "#1a1a1a", fontSize: '13px' }}>
                              {ad.adName}
                            </Text>
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
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t border-gray-200">
          <button
            onClick={handleClear}
            className="flex-1 py-3 rounded-xl text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200"
          >
            <Text weight="bold" style={{ fontSize: '14px' }}>Clear All</Text>
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              boxShadow: `0 4px 14px ${COLORS.primary}50`,
            }}
          >
            <Text weight="bold" style={{ fontSize: '14px' }}>Apply Filter</Text>
          </button>
        </div>
      </div>
    </div>
  );
}
