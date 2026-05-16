"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LeadCountsData } from "../types";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";
import { SlidersHorizontal, X, Check } from "lucide-react";

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

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────

interface DonutProps {
  segments: { value: number; color: string }[];
  total: number;
  size?: number;
  stroke?: number;
}

function DonutChart({ segments, total, size = 140, stroke = 22 }: DonutProps) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  let offset = -Math.PI / 2;
  const arcs: { d: string; color: string }[] = [];
  const positiveTotal = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);

  segments.forEach((seg) => {
    const val = Math.max(0, seg.value);
    if (val === 0) return;
    const angle = (val / positiveTotal) * 2 * Math.PI;
    const startAngle = offset;
    const endAngle = offset + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    arcs.push({ d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`, color: seg.color });
    offset += angle;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      {positiveTotal === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      ) : (
        arcs.map((arc, i) => (
          <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt" />
        ))
      )}
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="800" fill="#1E293B">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="500" fill="#94a3b8">Total Leads</text>
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
  onApply: (opts: { filter: string; customStartDate?: string; customEndDate?: string; staffId?: string }) => void;
}

function FilterModal({ open, currentFilter, currentStartDate, currentEndDate, currentStaffId, onClose, onApply }: FilterModalProps) {
  const [selFilter, setSelFilter] = useState(currentFilter);
  const [startDate, setStartDate] = useState(currentStartDate || "");
  const [endDate, setEndDate] = useState(currentEndDate || "");

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10"
        style={{ animation: "slideUp 0.22s cubic-bezier(.4,0,.2,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-center justify-between mb-5">
          <span className="text-[18px] font-extrabold text-[#1E293B]">Filter Summary</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">Date Period</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {DATE_FILTERS.map((f) => {
            const active = selFilter === f;
            return (
              <button
                key={f}
                onClick={() => setSelFilter(f)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-all ${active
                  ? "bg-[#1C3A76] text-white border-[#1C3A76] shadow-md"
                  : "bg-white text-[#1E293B] border-gray-200 hover:border-[#1C3A76]"
                }`}
              >
                {active && <Check size={11} strokeWidth={3} />}
                {f}
              </button>
            );
          })}
        </div>

        {selFilter === "Custom" && (
          <div className="flex gap-3 mb-5">
            {[
              { label: "Start Date", value: startDate, onChange: setStartDate, max: endDate || new Date().toISOString().split("T")[0] },
              { label: "End Date", value: endDate, onChange: setEndDate, min: startDate, max: new Date().toISOString().split("T")[0] },
            ].map(({ label, value, onChange, ...rest }) => (
              <div key={label} className="flex-1">
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">{label}</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-[#1E293B] outline-none focus:border-[#1C3A76] transition-colors"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  {...rest}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button onClick={handleClear} className="flex-1 py-3 rounded-2xl bg-gray-100 text-[#374151] font-semibold text-[14px] hover:bg-gray-200 transition-colors">
            Clear
          </button>
          <button
            onClick={handleApply}
            className="flex-2 flex-grow py-3 rounded-2xl text-white font-bold text-[14px] shadow-lg transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1C3A76 0%, #1E56A0 100%)" }}
          >
            Apply Filter
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(30px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadStatsSection({ data, filter, customStartDate, customEndDate, staffId, onFilterChange }: LeadStatsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const counts = data?.statusCounts;

  const statItems = [
    { label: "New Lead",   count: counts?.newLead   ?? counts?.newLeadCount   ?? 0, status: "New Lead",   color: COLORS.primaryDark },
    { label: "Hot Lead",   count: counts?.hotLead   ?? counts?.hotLeadCount   ?? 0, status: "Hot Lead",   color: COLORS.violet },
    { label: "Follow Up",  count: counts?.followUp  ?? counts?.followUpCount  ?? 0, status: "Follow Up",  color: COLORS.primary },
    { label: "Registered", count: counts?.registered ?? counts?.registerCount  ?? 0, status: "Register",  color: COLORS.anccent_green },
    { label: "Enrolled",   count: counts?.closed    ?? counts?.closedLeadCount ?? 0, status: "Closed",    color: COLORS.muted },
    { label: "RNR",        count: counts?.rnr       ?? counts?.rnrCount       ?? 0, status: "RNR",        color: COLORS.subtle },
  ];

  const totalLeads = data?.totalLeads ?? 0;
  const unassigned = data?.unAssignedCount ?? 0;

  const isFiltered = filter && filter !== "Overall";

  function getFilterLabel() {
    if (filter === "Custom" && customStartDate && customEndDate) {
      return `${formatDate(new Date(customStartDate))} – ${formatDate(new Date(customEndDate))}`;
    }
    return filter || "Overall";
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div>
          <Text size="custom" weight="bold" className="text-[20px] text-[#1E293B]">Leads Summary</Text>
          {isFiltered && (
            <p className="text-[12px] text-slate-400 mt-0.5">Filtered: {getFilterLabel()}</p>
          )}
        </div>

        <button
          id="lead-filter-btn"
          onClick={() => setModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all shadow-sm ${
            isFiltered
              ? "bg-[#1C3A76] text-white border-[#1C3A76]"
              : "bg-white text-[#1C3A76] border-[#E2E8F0] hover:border-[#1C3A76]"
          }`}
        >
          <SlidersHorizontal size={14} />
          {isFiltered ? getFilterLabel() : "Filter"}
          {isFiltered && (
            <button
              onClick={(e) => { e.stopPropagation(); onFilterChange?.({ filter: "Overall" }); }}
              className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={10} strokeWidth={3} />
            </button>
          )}
        </button>
      </div>

      {/* ── Main stats row ── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Donut + legend card */}
        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <Link href={leadsHref(null, filter)} className="flex-shrink-0 no-underline hover:opacity-80 transition-opacity">
            <DonutChart
              segments={statItems.map((s) => ({ value: s.count, color: s.color }))}
              total={totalLeads}
              size={140}
              stroke={24}
            />
          </Link>

          <div className="flex flex-col gap-2 flex-1 w-full">
            {statItems.map((stat) => (
              <Link
                key={stat.label}
                href={leadsHref(stat.status, filter)}
                className="flex items-center gap-3 group no-underline hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stat.color }} />
                <Text as="span" size="custom" weight="medium" className="text-[13px] text-slate-500 flex-1 group-hover:text-[#1E293B] transition-colors">
                  {stat.label}
                </Text>
                <Text as="span" size="custom" weight="bold" className="text-[14px] text-[#1E293B]">
                  {stat.count}
                </Text>
              </Link>
            ))}
          </div>
        </div>

        {/* Total + Unassigned cards */}
        <div className="flex lg:flex-col gap-4 lg:w-[180px]">
          <Link
            href={leadsHref(null, filter)}
            className="flex-1 lg:flex-none rounded-2xl p-5 flex flex-col justify-between no-underline hover:opacity-90 transition-opacity shadow-md group"
            style={{ background: "linear-gradient(135deg, #1C3A76 0%, #1E56A0 100%)" }}
          >
            <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">All Leads</span>
            <Text as="span" size="custom" weight="bold" className="text-[42px] font-extrabold text-white leading-none mt-2 group-hover:scale-105 transition-transform inline-block">
              {totalLeads}
            </Text>
          </Link>

          <Link
            href={`/leads_list?unassigned=true${filter && filter !== "Overall" ? `&filter=${filter}` : ""}`}
            className="flex-1 lg:flex-none bg-[#EEF4FB] border border-[#A5BCD1] rounded-2xl p-5 flex flex-col justify-between no-underline hover:bg-[#ddeaf8] transition-colors shadow-sm group"
          >
            <span className="text-[11px] font-semibold text-[#1C3A76]/70 uppercase tracking-widest">Unassigned</span>
            <Text as="span" size="custom" weight="bold" className="text-[42px] font-extrabold text-[#1C3A76] leading-none mt-2 group-hover:scale-105 transition-transform inline-block">
              {unassigned}
            </Text>
          </Link>
        </div>
      </div>

      {/* ── Status grid ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {statItems.map((card) => (
          <Link
            key={card.label}
            href={leadsHref(card.status, filter)}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm no-underline hover:shadow-md hover:border-[#A5BCD1] transition-all group"
          >
            <Text
              as="span"
              size="custom"
              weight="bold"
              className="text-[28px] font-extrabold leading-none mb-1.5 group-hover:scale-110 transition-transform inline-block"
              style={{ color: card.color }}
            >
              {card.count}
            </Text>
            <Text as="span" size="custom" weight="medium" className="text-[10px] text-slate-400 text-center leading-tight uppercase tracking-wide">
              {card.label}
            </Text>
          </Link>
        ))}
      </div>

      {/* ── Filter modal ── */}
      <FilterModal
        open={modalOpen}
        currentFilter={filter || "Overall"}
        currentStartDate={customStartDate}
        currentEndDate={customEndDate}
        currentStaffId={staffId}
        onClose={() => setModalOpen(false)}
        onApply={(opts) => onFilterChange?.(opts)}
      />
    </div>
  );
}
