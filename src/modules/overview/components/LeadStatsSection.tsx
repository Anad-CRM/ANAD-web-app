"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LeadCountsData } from "../types";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

// ─── Types ──────────────────────────────────────────────────────────────────

interface LeadStatsSectionProps {
  data: LeadCountsData | null;
  filter?: string;
  customStartDate?: string;
  customEndDate?: string;
  staffId?: string;
  onFilterChange?: (opts: {
    filter: string;
    customStartDate?: string;
    customEndDate?: string;
    staffId?: string;
  }) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function leadsHref(status: string | null, filter?: string): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (filter && filter !== "Overall") params.set("filter", filter);
  const qs = params.toString();
  return `/leads_list${qs ? `?${qs}` : ""}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function toIso(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────

interface DonutProps {
  segments: { value: number; color: string }[];
  total: number;
  size?: number;
  stroke?: number;
}

function DonutChart({ segments, total, size = 130, stroke = 20 }: DonutProps) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = total > 0 ? 1.5 : 0; // small gap between segments

  let offset = -Math.PI / 2; // start at top

  const arcs: { d: string; color: string; value: number }[] = [];

  const positiveTotal = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);

  segments.forEach((seg) => {
    const val = Math.max(0, seg.value);
    if (val === 0) return;
    const fraction = positiveTotal > 0 ? val / positiveTotal : 0;
    const angle = fraction * 2 * Math.PI;
    const gapAngle = positiveTotal > 0 ? (gap / circumference) * 2 * Math.PI : 0;
    const startAngle = offset + gapAngle / 2;
    const endAngle = offset + angle - gapAngle / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    arcs.push({
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: seg.color,
      value: val,
    });

    offset += angle;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      {positiveTotal === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      ) : (
        arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.d}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
          />
        ))
      )}
      {/* Center text */}
      <text
        x={cx}
        y={cy - 7}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fontWeight="800"
        fill="#1E293B"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="9"
        fontWeight="500"
        fill="#64748B"
      >
        Total
      </text>
    </svg>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────

const DATE_FILTERS = ["Overall", "This Day", "This Week", "This Month", "Custom"];

interface FilterModalProps {
  open: boolean;
  currentFilter: string;
  currentStartDate?: string;
  currentEndDate?: string;
  currentStaffId?: string;
  onClose: () => void;
  onApply: (opts: {
    filter: string;
    customStartDate?: string;
    customEndDate?: string;
    staffId?: string;
  }) => void;
}

function FilterModal({
  open,
  currentFilter,
  currentStartDate,
  currentEndDate,
  currentStaffId,
  onClose,
  onApply,
}: FilterModalProps) {
  const [selFilter, setSelFilter] = useState(currentFilter);
  const [startDate, setStartDate] = useState(currentStartDate || "");
  const [endDate, setEndDate] = useState(currentEndDate || "");

  // Sync when modal opens
  useEffect(() => {
    if (open) {
      setSelFilter(currentFilter);
      setStartDate(currentStartDate || "");
      setEndDate(currentEndDate || "");
    }
  }, [open, currentFilter, currentStartDate, currentEndDate]);

  if (!open) return null;

  function handleApply() {
    onApply({
      filter: selFilter,
      customStartDate: selFilter === "Custom" && startDate ? startDate : undefined,
      customEndDate: selFilter === "Custom" && endDate ? endDate : undefined,
      staffId: currentStaffId,
    });
    onClose();
  }

  function handleClear() {
    setSelFilter("Overall");
    setStartDate("");
    setEndDate("");
    onApply({ filter: "Overall" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[18px] font-extrabold text-[#1E293B]">Filter Summary</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Date Filter */}
        <p className="text-[13px] font-bold text-[#1E293B] mb-3">Date Filter</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {DATE_FILTERS.map((f) => {
            const active = selFilter === f;
            return (
              <button
                key={f}
                onClick={() => setSelFilter(f)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-all ${active
                  ? "bg-[#233A78] text-white border-[#233A78]"
                  : "bg-white text-[#1E293B] border-gray-300 hover:border-[#233A78]"
                  }`}
              >
                {active && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
                {f}
              </button>
            );
          })}
        </div>

        {/* Custom Date Range */}
        {selFilter === "Custom" && (
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-[#1E293B] outline-none focus:border-[#233A78] transition-colors"
                value={startDate}
                max={endDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">End Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-[#1E293B] outline-none focus:border-[#233A78] transition-colors"
                value={endDate}
                min={startDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleClear}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-[#374151] font-semibold text-[14px] hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-2xl text-white font-bold text-[14px] shadow-lg transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #233A78 0%, #1E56A0 100%)" }}
          >
            Apply Filter
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.22s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
}

// ─── Active Filter Chip ───────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#EEF4FB] text-[#233A78] border border-[#A5BCD1]">
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:text-red-500 transition-colors">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadStatsSection({
  data,
  filter,
  customStartDate,
  customEndDate,
  staffId,
  onFilterChange,
}: LeadStatsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const counts = data?.statusCounts;

  // ── stat rows (donut legend + grid) ──
  const statItems = [
    { label: "New Lead", count: counts?.newLead ?? counts?.newLeadCount ?? 0, status: "New Lead", color: COLORS.primaryDark },
    { label: "Hot Lead", count: counts?.hotLead ?? counts?.hotLeadCount ?? 0, status: "Hot Lead", color: COLORS.violet },
    { label: "Follow Up", count: counts?.followUp ?? counts?.followUpCount ?? 0, status: "Follow Up", color: COLORS.primary },
    { label: "Registered", count: counts?.registered ?? counts?.registerCount ?? 0, status: "Register", color: COLORS.anccent_green },
    { label: "Enrolled", count: counts?.closed ?? counts?.closedLeadCount ?? 0, status: "Closed", color: COLORS.muted },
    {
      label: "RNR", count: (counts as any)?.rnr ?? (counts as any)?.rnrCount ?? 0, status: "RNR", color: COLORS.subtle

    },
  ];

  const totalLeads = data?.totalLeads ?? 0;
  const unassigned = data?.unAssignedCount ?? 0;

  // Determine active filter label(s) for chips
  const isFiltered =
    (filter && filter !== "Overall") ||
    (filter === "Custom" && customStartDate && customEndDate);

  function removeFilter() {
    onFilterChange?.({ filter: "Overall" });
  }

  function getFilterLabel() {
    if (filter === "Custom" && customStartDate && customEndDate) {
      return `${formatDate(new Date(customStartDate))} – ${formatDate(new Date(customEndDate))}`;
    }
    return filter || "Overall";
  }

  return (
    <div className="mb-8">
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-3">
        <Text size="custom" weight="bold" className="text-[18px] text-black">
          Leads Summary
        </Text>

        <button
          id="lead-filter-btn"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E2E8F0] shadow-sm hover:bg-gray-50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#233A78]">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span className="text-[13px] font-bold text-[#233A78]">
            {filter && filter !== "Overall" ? getFilterLabel() : "Filter"}
          </span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-[#1E56A0]" />
          )}
        </button>
      </div>

      {/* ── Active Filter Chips ── */}
      {isFiltered && (
        <div className="flex flex-wrap gap-2 mb-3">
          <FilterChip label={getFilterLabel()} onRemove={removeFilter} />
        </div>
      )}

      {/* ── Top Row: Donut + legend + summary cards ── */}
      <div className="flex gap-4 items-stretch min-h-[180px]">
        {/* Donut + legend */}
        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex items-center gap-6">
          <Link href={leadsHref(null, filter)} className="flex-shrink-0 no-underline hover:opacity-80 transition-opacity">
            <DonutChart
              segments={statItems.map((s) => ({ value: s.count, color: s.color }))}
              total={totalLeads}
              size={128}
              stroke={22}
            />
          </Link>

          {/* Legend */}
          <div className="flex flex-col gap-[7px] flex-1">
            {statItems.map((stat) => (
              <Link
                key={stat.label}
                href={leadsHref(stat.status, filter)}
                className="flex items-center gap-2.5 group no-underline hover:bg-gray-50 rounded-lg px-1 py-0.5 transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stat.color }}
                />
                <span className="text-[12px] text-gray-600 flex-1 whitespace-nowrap group-hover:text-black transition-colors font-medium">
                  {stat.label}
                </span>
                <span className="text-[13px] font-bold text-[#1E293B] w-7 text-right flex-shrink-0">
                  {stat.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="flex flex-col gap-3">
          <Link
            href={leadsHref(null, filter)}
            className="flex-1 min-w-[160px] bg-gradient-to-br from-[#233A78] to-[#1E56A0] rounded-2xl p-5 flex flex-col justify-between shadow-md no-underline hover:opacity-90 transition-opacity group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-white/80">All Leads</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-60"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <span className="text-[40px] font-extrabold text-white leading-none group-hover:scale-105 transition-transform inline-block">
              {totalLeads}
            </span>
          </Link>

          <Link
            href={`/leads_list?unassigned=true${filter && filter !== "Overall" ? `&filter=${filter}` : ""}`}
            className="flex-1 min-w-[160px] bg-[#EEF4FB] border border-[#A5BCD1] rounded-2xl p-5 flex flex-col justify-between shadow-sm no-underline hover:bg-[#ddeaf8] transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-[#233A78]/70">Unassigned</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#233A78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
            </div>
            <span className="text-[40px] font-extrabold text-[#233A78] leading-none group-hover:scale-105 transition-transform inline-block">
              {unassigned}
            </span>
          </Link>
        </div>
      </div>

      {/* ── Status grid ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        {statItems.map((card) => (
          <Link
            key={card.label}
            href={leadsHref(card.status, filter)}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm no-underline hover:shadow-md hover:border-[#A5BCD1] transition-all group"
          >
            <span
              className="text-[26px] font-extrabold leading-none mb-1.5 group-hover:scale-105 transition-transform inline-block"
              style={{ color: card.color }}
            >
              {card.count}
            </span>
            <span className="text-[11px] text-gray-500 text-center font-medium leading-tight">
              {card.label}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Filter Modal ── */}
      <FilterModal
        open={modalOpen}
        currentFilter={filter || "Overall"}
        currentStartDate={customStartDate}
        currentEndDate={customEndDate}
        currentStaffId={staffId}
        onClose={() => setModalOpen(false)}
        onApply={(opts) => {
          onFilterChange?.(opts);
        }}
      />
    </div>
  );
}
