"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { COLORS } from "@/core/components/theme/colors";
import { LeadCard } from "./LeadCard";
import { LeadFilterSheet, FilterState } from "./LeadFilterSheet";
import { leadsApi, FetchLeadsParams } from "../api/leadsApi";
import { Lead } from "../types/lead.types";
import { ArrowLeft, } from 'lucide-react';

// ── Helper: build API payload from filter state ─────────────────────────────

function buildPayload(
  searchTerm: string,
  filters: FilterState,
  statusParam: string | null,
  userIdParam: string | null,
  offset: number,
): FetchLeadsParams {
  const payload: FetchLeadsParams = {
    keyword: searchTerm.trim(),
    offset,
    limit: 30,
    sortByDate: "latest",
  };

  // Status: explicit filter beats URL param
  if (filters.statuses.length > 0) {
    payload.status = filters.statuses;
  } else if (statusParam) {
    payload.status = statusParam;
  }

  // Staff filter
  if (filters.staffIds.length > 0) {
    payload.staffId = filters.staffIds.length === 1
      ? filters.staffIds[0]
      : filters.staffIds;
  }

  // User filter from URL (e.g. clicking a stat on staff profile)
  if (userIdParam) payload.userId = userIdParam;

  // Date filter
  if (filters.datePreset && filters.datePreset !== "Custom") {
    payload.filter = filters.datePreset.replace(" ", "") as FetchLeadsParams["filter"];
  } else if (filters.datePreset === "Custom") {
    payload.filter = "Custom";
  }
  if (filters.startDate) payload.startDate = filters.startDate;
  if (filters.endDate) payload.endDate = filters.endDate;

  return payload;
}

// ── Component ──────────────────────────────────────────────────────────────

const EMPTY_FILTERS: FilterState = {
  statuses: [],
  staffIds: [],
  datePreset: null,
  startDate: null,
  endDate: null,
};

export function LeadList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get("status");
  const userIdParam = searchParams.get("userId");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [staffMembers, setStaffMembers] = useState<{ id: string; userName: string }[]>([]);

  const offsetRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.staffIds.length > 0 ||
    filters.datePreset != null ||
    !!statusParam ||
    !!userIdParam;

  // Load staff members once for filter sheet
  useEffect(() => {
    leadsApi.fetchStaffMembers().then(staff => {
      setStaffMembers(staff as { id: string; userName: string }[]);
    });
  }, []);

  const loadLeads = useCallback(async (reset: boolean) => {
    if (reset) {
      offsetRef.current = 0;
      setIsLoading(true);
      setLeads([]);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const payload = buildPayload(
        searchTerm,
        filters,
        statusParam,
        userIdParam,
        offsetRef.current,
      );

      const res = await leadsApi.fetchLeads(payload);

      if (res.status === "success" && res.data) {
        const incoming = res.data;

        if (reset) {
          setLeads(incoming);
        } else {
          setLeads(prev => [...prev, ...incoming]);
        }

        setHasMore(incoming.length === 30);
        offsetRef.current += incoming.length;
      } else {
        if (reset) setLeads([]);
        setHasMore(false);
      }
    } catch {
      if (reset) setLeads([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchTerm, filters, statusParam, userIdParam]);

  // Debounce search changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadLeads(true);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [loadLeads]);

  function handleApplyFilters(newFilters: FilterState) {
    setFilters(newFilters);
  }

  function handleClearAll() {
    setFilters(EMPTY_FILTERS);
  }

  function handleLoadMore() {
    if (!isLoadingMore && hasMore) {
      loadLeads(false);
    }
  }

  // ── Active filter pills ────────────────────────────────────────────────
  const activePills: { label: string; onRemove: () => void }[] = [];

  if (statusParam && filters.statuses.length === 0) {
    activePills.push({ label: statusParam, onRemove: () => { } }); // URL-driven, not removable here
  }
  filters.statuses.forEach(s =>
    activePills.push({
      label: s,
      onRemove: () =>
        setFilters(f => ({ ...f, statuses: f.statuses.filter(x => x !== s) })),
    })
  );
  if (filters.datePreset) {
    activePills.push({
      label: filters.datePreset,
      onRemove: () => setFilters(f => ({ ...f, datePreset: null, startDate: null, endDate: null })),
    });
  }

  return (
    <>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-md flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">
            {statusParam
              ? statusParam.endsWith("Lead")
                ? statusParam + "s"
                : statusParam === "Follow Up"
                  ? "Follow Ups"
                  : statusParam
              : "Leads List"}
          </h1>
        </div>

        {/* ── Search + Filter Row ── */}
        <div className="flex items-center gap-3 relative">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
              style={{ color: COLORS.subtle }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full placeholder-gray-400 border-none rounded-full py-3.5 pl-11 pr-10 focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                backgroundColor: COLORS.surface,
                color: COLORS.text,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                outlineColor: COLORS.primary,
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                style={{ color: COLORS.subtle }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="relative p-3.5 rounded-xl text-white transition-all hover:opacity-90 hover:-translate-y-0.5 flex items-center justify-center"
            style={{
              backgroundColor: hasActiveFilters ? COLORS.primary : COLORS.primaryDark,
              boxShadow: `0 4px 14px ${COLORS.primary}40`,
            }}
            title="Filter Leads"
          >
            <Filter size={20} />
            {hasActiveFilters && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: COLORS.warning }}
              >
                {activePills.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Active filter pills ── */}
        {activePills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activePills.map((pill, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: COLORS.primaryXlight,
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.primaryLight}`,
                }}
              >
                {pill.label}
                <button onClick={pill.onRemove} className="hover:opacity-70">
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearAll}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full hover:opacity-70 transition-opacity"
              style={{ color: COLORS.danger, backgroundColor: "#9B222610" }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Lead count label ── */}
        {!isLoading && (
          <p className="text-[12px] font-medium" style={{ color: COLORS.muted }}>
            {leads.length} lead{leads.length !== 1 ? "s" : ""} found
            {statusParam && filters.statuses.length === 0 ? ` · ${statusParam}` : ""}
          </p>
        )}

        {/* ── Leads Grid ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-52">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="animate-spin rounded-full h-9 w-9 border-[3px] border-t-transparent"
                  style={{ borderColor: `${COLORS.primary}40`, borderTopColor: COLORS.primary }}
                />
                <p className="text-[13px]" style={{ color: COLORS.muted }}>Loading leads...</p>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-60 space-y-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.primaryXlight }}
              >
                <Search size={28} style={{ color: COLORS.primary }} />
              </div>
              <p className="text-[15px] font-semibold" style={{ color: COLORS.text }}>No leads found</p>
              <p className="text-[12px]" style={{ color: COLORS.muted }}>
                {hasActiveFilters ? "Try adjusting your filters" : "No leads available yet"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="text-[12px] font-bold underline"
                  style={{ color: COLORS.primary }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 auto-rows-max">
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    searchKeyword={searchTerm}
                    showStatusBadge={true}
                    onStatusChange={(leadId, newStatus) => {
                      setLeads(prev =>
                        prev.map(l => l.id === leadId ? { ...l, status: newStatus as Lead["status"] } : l)
                      );
                    }}
                    onClick={() => {
                      // Store lead in sessionStorage so detail page can read it without re-fetching
                      // (mirrors Flutter: lead data is passed as a prop, not re-fetched)
                      try { sessionStorage.setItem(`lead_cache_${lead.id}`, JSON.stringify(lead)); } catch { }
                      router.push(`/lead/${lead.id}`);
                    }}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:opacity-90"
                    style={{
                      backgroundColor: COLORS.primaryXlight,
                      color: COLORS.primary,
                      border: `1px solid ${COLORS.primaryLight}`,
                    }}
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Filter Sheet Overlay ── */}
      <LeadFilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={filters}
        onApply={handleApplyFilters}
        onClearAll={handleClearAll}
        staffMembers={staffMembers}
        lockedStatus={statusParam || undefined}
      />
    </>
  );
}
