"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, Filter, X, Users } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { COLORS } from "@/core/components/theme/colors";
import { LeadCard } from "./LeadCard";
import { BackButton } from "@/core/components/ui/BackButton";
import { LeadFilterSheet, FilterState } from "./LeadFilterSheet";
import { leadsApi, FetchLeadsParams } from "../api/leadsApi";
import { Lead } from "../types/lead.types";
import { TeamsService } from "../../teams/services/teams.service";
import { getAllAds } from "../../ads/api/adsApi";
import { getUser } from "@/core/utils/auth";
import { Text } from "@/core/components/ui/Text";

// ── Helper: build API payload from filter state ─────────────────────────────

function buildPayload(
  searchTerm: string,
  filters: FilterState,
  statusParam: string | null,
  userIdParam: string | null,
  staffIdParam: string | null,
  teamIdParam: string | null,
  offset: number,
): FetchLeadsParams {
  const payload: FetchLeadsParams = {
    keyword: searchTerm.trim(),
    offset,
    limit: 20,
    sortByDate: "latest",
  };

  // Status: explicit filter beats URL param
  if (filters.statuses.length > 0) {
    payload.status = filters.statuses;
  } else if (statusParam) {
    payload.status = statusParam;
  }

  // Staff filter: explicit sheet filter beats URL param
  if (filters.staffIds.length > 0) {
    payload.staffId = filters.staffIds.length === 1
      ? filters.staffIds[0]
      : filters.staffIds;
  } else if (staffIdParam) {
    // staffId URL param (from staff profile stat cards)
    payload.staffId = staffIdParam;
  }

  // Team filters
  if (filters.teamIds.length > 0) {
    payload.teamId = filters.teamIds.length === 1
      ? filters.teamIds[0]
      : filters.teamIds;
  } else if (teamIdParam) {
    payload.teamId = teamIdParam;
  }

  // Ad filters
  if (filters.adIds.length > 0) {
    payload.adIds = filters.adIds;
  }

  // User filter from URL (e.g. clicking a stat on staff profile)
  // userId URL param (legacy — kept for backwards compat)
  if (userIdParam) payload.userId = userIdParam;

  // Date filter
  if (filters.datePreset && filters.datePreset !== "Custom") {
    payload.filter = filters.datePreset as FetchLeadsParams["filter"];
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
  teamIds: [],
  adIds: [],
  datePreset: null,
  startDate: null,
  endDate: null,
};

export function LeadList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get("status");
  const adIdParam = searchParams.get("adId");
  const userIdParam = searchParams.get("userId");
  const staffIdParam = searchParams.get("staffId");
  const teamIdParam = searchParams.get("teamId");

  const isUnassigned = searchParams.get("unassigned") === "true";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [staffMembers, setStaffMembers] = useState<{ id: string; userName: string }[]>([]);

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffToAssign, setStaffToAssign] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [ads, setAds] = useState<{ id: string; adName: string; platform?: string }[]>([]);
  const selectedAdLabel = useMemo(() => {
    if (!adIdParam) return "";
    return ads.find((ad) => ad.id === adIdParam)?.adName || "Ad filtered";
  }, [ads, adIdParam]);


  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync query values into refs so loadLeads never needs to be recreated ──
  // This prevents state updates (from load-more) from cascading into a full reset.
  const searchTermRef = useRef(searchTerm);
  const filtersRef = useRef(filters);
  const statusParamRef = useRef(statusParam);
  const adIdParamRef = useRef(adIdParam);
  const userIdParamRef = useRef(userIdParam);
  const staffIdParamRef = useRef(staffIdParam);
  const teamIdParamRef = useRef(teamIdParam);
  const isUnassignedRef = useRef(isUnassigned);
  searchTermRef.current = searchTerm;
  filtersRef.current = filters;
  statusParamRef.current = statusParam;
  adIdParamRef.current = adIdParam;
  userIdParamRef.current = userIdParam;
  staffIdParamRef.current = staffIdParam;
  teamIdParamRef.current = teamIdParam;
  isUnassignedRef.current = isUnassigned;

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.staffIds.length > 0 ||
    filters.teamIds.length > 0 ||
    filters.adIds.length > 0 ||
    filters.datePreset != null ||
    !!statusParam ||
    !!userIdParam ||
    !!staffIdParam ||
    !!teamIdParam ||
    isUnassigned;

  // Load auxiliary data for filters
  useEffect(() => {
    leadsApi.fetchStaffMembers().then(staff => {
      setStaffMembers(staff as { id: string; userName: string }[]);
    });

    // Using user info to fetch teams if available
    const user = getUser<{ id?: string; organizationId?: string; role?: string; }>();
    if (user?.organizationId) {
      TeamsService.getAllTeams({ organizationId: user.organizationId }).then(res => {
        if (res.status === "success" && res.data) {
          setTeams(res.data);
        }
      }).catch(() => { });

      getAllAds({ organizationId: user.organizationId }).then((data) => {
        setAds((data || []).map((ad) => ({ ...ad, id: String(ad.id) })));
      }).catch(() => { });
    }
  }, []);

  // Stable — reads all query values from refs, never recreated on state changes.
  const loadLeads = useCallback(async (reset: boolean) => {
    // Prevent duplicate calls if we're already fetching
    if (isFetchingRef.current && !reset) return;
    isFetchingRef.current = true;

    if (reset) {
      offsetRef.current = 0;
      setIsLoading(true);
      setLeads([]);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const payload = buildPayload(
        searchTermRef.current,
        filtersRef.current,
        statusParamRef.current,
        userIdParamRef.current,
        staffIdParamRef.current,
        teamIdParamRef.current,
        offsetRef.current,
      );
      if (adIdParamRef.current) {
        payload.adId = adIdParamRef.current;
      }
      // Unassigned filter: pass isUnassigned flag to API
      if (isUnassignedRef.current) {
        payload.isUnassigned = true;
        delete payload.status;
      }

      const res = await leadsApi.fetchLeads(payload);

      if (res.status === "success" && res.data) {
        const incoming = res.data;

        // Batch limit is 20. If we got 20, there might be more.
        const hasMoreFromApi = incoming.length >= 20;
        setHasMore(hasMoreFromApi);

        if (reset) {
          setLeads(incoming);
        } else {
          setLeads(prev => {
            // Filter out any duplicates returned by the API or caused by race conditions
            const existingIds = new Set(prev.map(l => l.id));
            const uniqueIncoming = incoming.filter(l => !existingIds.has(l.id));
            return [...prev, ...uniqueIncoming];
          });
        }

        offsetRef.current += incoming.length;
      } else {
        if (reset) setLeads([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading leads:", err);
      if (reset) setLeads([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []); // Intentionally empty — reads all query values from refs

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadLeads(true);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters, statusParam, userIdParam, staffIdParam, adIdParam, isUnassigned]);



  function handleApplyFilters(newFilters: FilterState) {
    setFilters(newFilters);
  }

  function handleClearAll() {
    setFilters(EMPTY_FILTERS);
  }

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading && !isFetchingRef.current) {
          loadLeads(false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, loadLeads]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedLeadIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map(l => l.id));
    }
  };

  const handleAssign = async () => {
    if (!staffToAssign || selectedLeadIds.length === 0) return;
    setIsAssigning(true);
    try {
      await leadsApi.assignLeads(selectedLeadIds, staffToAssign);
      setIsAssignModalOpen(false);
      setSelectedLeadIds([]);
      setIsSelectionMode(false);
      loadLeads(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssigning(false);
    }
  };


  const activePills: { label: string; onRemove: () => void }[] = [];

  if (statusParam && filters.statuses.length === 0) {
    activePills.push({ label: statusParam, onRemove: () => { } }); 
  }
  if (adIdParam && filters.adIds.length === 0) {
    activePills.push({ label: selectedAdLabel, onRemove: () => { } });
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
      <div className="flex flex-col space-y-2 sm:space-y-3 pb-6">
        <div className="sticky top-[-16px] sm:top-[-24px] md:top-[-32px] -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 z-40 bg-[#DCE6F2] pt-0 pb-3">
        <div className="flex items-center gap-2 flex-wrap mb-0.5 sm:mb-1">
          <BackButton onClick={() => router.back()} />
          <Text as="h1" weight="semibold" className="text-slate-800 text-[16px] sm:text-[18px] leading-tight">
            {isUnassigned
              ? "Unassigned Leads"
              : statusParam
                ? statusParam.endsWith("Lead")
                  ? statusParam + "s"
                  : statusParam === "Follow Up"
                    ? "Follow Ups"
                    : statusParam
                : "Leads List"}
          </Text>
        </div>

        {/* ── Search + Filter Row ── */}
        <div className="flex items-start gap-2 relative">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
              style={{ color: COLORS.subtle }}>
              <Search size={17} />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full placeholder-gray-400 border-none rounded-full py-3 pl-10 pr-9 focus:outline-none focus:ring-2 transition-all duration-200 text-[14px] sm:text-[15px]"
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

          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Filter button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="relative w-10 h-10 sm:w-auto sm:h-auto sm:px-3.5 sm:py-3 rounded-full sm:rounded-xl text-white transition-all hover:opacity-90 hover:-translate-y-0.5 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: hasActiveFilters ? COLORS.primary : COLORS.primaryDark,
                boxShadow: `0 4px 14px ${COLORS.primary}40`,
              }}
              title="Filter Leads"
            >
              <Filter size={17} className="sm:w-5 sm:h-5" />
              {hasActiveFilters && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: COLORS.warning }}
                >
                  {activePills.length}
                </span>
              )}
            </button>

            {leads.length > 0 && (
              <button
                onClick={toggleSelectionMode}
                className={`text-[11px] sm:text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors border ${isSelectionMode
                  ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
              >
                {isSelectionMode ? "Cancel" : "Select"}
              </button>
            )}
          </div>
        </div>

        {/* ── Active filter pills ── */}
        {activePills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            {activePills.map((pill, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1.5 rounded-full"
                style={{
                  backgroundColor: COLORS.primaryXlight,
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.primaryLight}`,
                }}
              >
                <Text weight="semibold" className="text-[10px] sm:text-[11px]">{pill.label}</Text>
                <button onClick={pill.onRemove} className="hover:opacity-70">
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearAll}
              className="hidden sm:inline-flex text-[11px] font-semibold px-3 py-1.5 rounded-full hover:opacity-70 transition-opacity"
              style={{ color: COLORS.danger, backgroundColor: "#9B222610" }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Selection Action Bar ── */}
        <div className="mt-1 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          {!isLoading && (
            <Text weight="medium" className="text-[11px] sm:text-[12px] leading-tight" style={{ color: COLORS.muted }}>
              {leads.length} lead{leads.length !== 1 ? "s" : ""} found
              {statusParam && filters.statuses.length === 0 ? ` · ${statusParam}` : ""}
              {adIdParam && filters.adIds.length === 0 ? ` · ${selectedAdLabel || "Ad filtered"}` : ""}
            </Text>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {activePills.length > 0 && (
              <button
                onClick={handleClearAll}
                className="sm:hidden text-[11px] font-semibold px-3 py-1.5 rounded-full hover:opacity-70 transition-opacity"
                style={{ color: COLORS.danger, backgroundColor: "#9B222610" }}
              >
                Clear all
              </button>
            )}

            {leads.length > 0 && (
              <>
              {isSelectionMode && (
                <>
                  <button
                    onClick={toggleSelectAll}
                    className="text-[11px] sm:text-[12px] font-semibold text-primary px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    {selectedLeadIds.length === leads.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    disabled={selectedLeadIds.length === 0}
                    onClick={() => setIsAssignModalOpen(true)}
                    className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-bold text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <Users size={14} />
                    <Text weight="bold" className="text-[11px] sm:text-[12px]">Assign ({selectedLeadIds.length})</Text>
                  </button>
                </>
              )}
              </>
            )}
          </div>
        </div>

        </div>

        {/* ── Leads Grid ── */}

        <div className="px-0 sm:px-1 md:px-2 lg:px-3 py-3 sm:py-4">

          {isLoading ? (
            <div className="flex justify-center items-center h-52">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="animate-spin rounded-full h-9 w-9 border-[3px] border-t-transparent"
                  style={{ borderColor: `${COLORS.primary}40`, borderTopColor: COLORS.primary }}
                />
                <Text style={{ color: COLORS.muted, fontSize: '13px' }}>Loading leads...</Text>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col justify-center items-center min-h-[280px] sm:min-h-[360px] space-y-2 text-center px-4">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.primaryXlight }}
              >
                <Search size={24} className="sm:w-7 sm:h-7" style={{ color: COLORS.primary }} />
              </div>
              <Text weight="semibold" className="text-[15px] sm:text-[16px]" style={{ color: COLORS.text }}>No leads found</Text>
              <Text className="text-[12px] sm:text-[13px]" style={{ color: COLORS.muted }}>
                {hasActiveFilters ? "Try adjusting your filters" : "No leads available yet"}
              </Text>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="underline"
                  style={{ color: COLORS.primary }}
                >
                  <Text weight="bold" style={{ fontSize: '12px' }}>Clear Filters</Text>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 auto-rows-max">
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    searchKeyword={searchTerm}
                    showStatusBadge={true}
                    isSelected={selectedLeadIds.includes(lead.id)}
                    onStatusChange={(leadId, newStatus) => {
                      setLeads(prev =>
                        prev.map(l => l.id === leadId ? { ...l, status: newStatus as Lead["status"] } : l)
                      );
                    }}
                    onAssignClick={() => {
                      setSelectedLeadIds([lead.id]);
                      setIsAssignModalOpen(true);
                    }}
                    onClick={() => {
                      if (isSelectionMode) {
                        setSelectedLeadIds(prev =>
                          prev.includes(lead.id) ? prev.filter(id => id !== lead.id) : [...prev, lead.id]
                        );
                        return;
                      }
                      // Store lead in sessionStorage so detail page can read it without re-fetching
                      // (mirrors Flutter: lead data is passed as a prop, not re-fetched)
                      try { sessionStorage.setItem(`lead_cache_${lead.id}`, JSON.stringify(lead)); } catch { }
                      router.push(`/lead/${lead.id}`);
                    }}
                  />
                ))}
              </div>

              {hasMore && !isLoading && (
                <div ref={observerTarget} className="h-4 w-full" aria-hidden="true" />
              )}

              {/* Load more spinner */}
              {hasMore && isLoadingMore && (
                <div className="flex justify-center mt-6 pb-6">
                  <div className="flex items-center gap-2">
                    <div
                      className="animate-spin rounded-full h-5 w-5 border-[2px] border-t-transparent"
                      style={{ borderColor: `${COLORS.primary}40`, borderTopColor: COLORS.primary }}
                    />
                    <Text weight="medium" style={{ color: COLORS.primary, fontSize: '13px' }}>
                      Loading more...
                    </Text>
                  </div>
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
        teams={teams}
        ads={ads}
        lockedStatus={statusParam || undefined}
      />

      {/* ── Assign Staff Modal ── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(13,27,62,0.55)", backdropFilter: "blur(3px)" }}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100">
              <Text as="h3" weight="bold" className="text-gray-900" style={{ fontSize: '16px' }}>Assign Leads</Text>
              <Text className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>
                Select a staff member to assign {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? 's' : ''} to.
              </Text>
            </div>
            <div className="p-5">
              <Text className="block font-semibold text-gray-700 mb-2" style={{ fontSize: '13px' }}>Staff Member</Text>
              <select
                value={staffToAssign}
                onChange={(e) => setStaffToAssign(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1C3A76]/20 focus:border-[#1C3A76] outline-none transition-all"
              >
                <option value="">Select a staff member</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.userName}</option>
                ))}
              </select>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  if (!isSelectionMode) setSelectedLeadIds([]); // Clear if it was a single assign
                }}
                className="px-5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
                disabled={isAssigning}
              >
                <Text weight="semibold" style={{ fontSize: '13px' }}>Cancel</Text>
              </button>
              <button
                onClick={handleAssign}
                disabled={!staffToAssign || isAssigning}
                className="px-5 py-2.5 rounded-xl text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text weight="bold" style={{ fontSize: '13px' }}>
                  {isAssigning ? "Assigning..." : "Confirm Assignment"}
                </Text>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
