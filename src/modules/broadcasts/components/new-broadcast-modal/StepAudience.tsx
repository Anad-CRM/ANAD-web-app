"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, Search, Check, Loader2, AlertCircle } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { LEAD_STATUSES } from "@/modules/broadcasts/constants/broadcastConstants";
import { api } from "@/core/api/axios";

interface LeadItem {
  id: string;
  userName?: string | null;
  mobileNumber?: string | null;
  status?: string | null;
}

interface StepAudienceProps {
  audienceType: string;
  onAudienceTypeChange: (val: string) => void;
  selectedLeadIds: string[];
  onSelectedLeadIdsChange: (ids: string[]) => void;
}

/**
 * Step 2 — Target audience selection with live recipient calculation and individual lead selection.
 */
export function StepAudience({
  audienceType,
  onAudienceTypeChange,
  selectedLeadIds,
  onSelectedLeadIdsChange,
}: StepAudienceProps) {
  const [mode, setMode] = useState<"status" | "specific">(
    audienceType === "selected" ? "specific" : "status"
  );
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch leads for lead counter & specific lead picker
  useEffect(() => {
    let isMounted = true;
    async function fetchLeads() {
      setLoadingLeads(true);
      try {
        const res = await api.post("/lead/getLeadsByStatus", { status: "all", limit: 500 });
        const leadList: LeadItem[] = res.data?.data?.leads || res.data?.data || res.data?.leads || [];
        if (isMounted) {
          setLeads(Array.isArray(leadList) ? leadList : []);
        }
      } catch (err) {
        console.warn("Failed to fetch leads for audience count:", err);
      } finally {
        if (isMounted) setLoadingLeads(false);
      }
    }
    fetchLeads();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter leads based on status or search query
  const validLeads = useMemo(() => {
    return leads.filter(
      (l) => l.mobileNumber && String(l.mobileNumber).trim() !== "" && String(l.mobileNumber).trim() !== "N/A"
    );
  }, [leads]);

  const recipientCount = useMemo(() => {
    if (mode === "specific") {
      return selectedLeadIds.length;
    }
    if (audienceType === "all") {
      return validLeads.length;
    }
    return validLeads.filter((l) => l.status === audienceType).length;
  }, [mode, audienceType, selectedLeadIds, validLeads]);

  const filteredSpecificLeads = useMemo(() => {
    if (!searchQuery.trim()) return validLeads;
    const q = searchQuery.toLowerCase();
    return validLeads.filter(
      (l) =>
        (l.userName && l.userName.toLowerCase().includes(q)) ||
        (l.mobileNumber && l.mobileNumber.toLowerCase().includes(q))
    );
  }, [validLeads, searchQuery]);

  const toggleSelectLead = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      onSelectedLeadIdsChange(selectedLeadIds.filter((item) => item !== id));
    } else {
      onSelectedLeadIdsChange([...selectedLeadIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredSpecificLeads.length) {
      onSelectedLeadIdsChange([]);
    } else {
      onSelectedLeadIdsChange(filteredSpecificLeads.map((l) => l.id));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Mode Switcher */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
          Target Audience Selection
        </label>
        <div className="flex gap-2 rounded-xl border bg-gray-50 p-1" style={{ borderColor: "#E5E7EB" }}>
          <button
            type="button"
            onClick={() => {
              setMode("status");
              if (audienceType === "selected") onAudienceTypeChange("all");
            }}
            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
            style={{
              backgroundColor: mode === "status" ? "white" : "transparent",
              color: mode === "status" ? COLORS.primary : COLORS.muted,
              boxShadow: mode === "status" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Filter by Lead Status
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("specific");
              onAudienceTypeChange("selected");
            }}
            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
            style={{
              backgroundColor: mode === "specific" ? "white" : "transparent",
              color: mode === "specific" ? COLORS.primary : COLORS.muted,
              boxShadow: mode === "specific" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Select Specific Leads ({selectedLeadIds.length})
          </button>
        </div>
      </div>

      {mode === "status" ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs" style={{ color: COLORS.muted }}>
            Select which status category of leads should receive this WhatsApp broadcast campaign.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-0.5">
            {LEAD_STATUSES.map((status) => {
              const isSelected = audienceType === status.value;
              const count =
                status.value === "all"
                  ? validLeads.length
                  : validLeads.filter((l) => l.status === status.value).length;

              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => onAudienceTypeChange(status.value)}
                  className="flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all"
                  style={{
                    borderColor: isSelected ? COLORS.primary : "#E5E7EB",
                    backgroundColor: isSelected ? `${COLORS.primary}08` : "white",
                    color: isSelected ? COLORS.primary : COLORS.text,
                    outline: isSelected ? `2px solid ${COLORS.primary}20` : "none",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-4 w-4 items-center justify-center rounded-full border"
                      style={{ borderColor: isSelected ? COLORS.primary : "#CBD5E1" }}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                      )}
                    </div>
                    <span>{status.label}</span>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: isSelected ? `${COLORS.primary}15` : "#F3F4F6",
                      color: isSelected ? COLORS.primary : COLORS.muted,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Specific Leads Selector */
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                style={{ borderColor: "#D1D5DB" }}
              />
            </div>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-xl border px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100"
              style={{ borderColor: "#D1D5DB" }}
            >
              {selectedLeadIds.length === filteredSpecificLeads.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto border rounded-xl p-2 bg-gray-50/50" style={{ borderColor: "#E5E7EB" }}>
            {filteredSpecificLeads.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: COLORS.muted }}>
                No leads with valid phone numbers match your search.
              </p>
            ) : (
              filteredSpecificLeads.map((lead) => {
                const isChecked = selectedLeadIds.includes(lead.id);
                return (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => toggleSelectLead(lead.id)}
                    className="flex items-center justify-between rounded-lg p-2.5 bg-white border text-left transition-colors hover:bg-blue-50/50"
                    style={{ borderColor: isChecked ? COLORS.primary : "#E5E7EB" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-4 w-4 items-center justify-center rounded border transition-colors"
                        style={{
                          backgroundColor: isChecked ? COLORS.primary : "white",
                          borderColor: isChecked ? COLORS.primary : "#D1D5DB",
                        }}
                      >
                        {isChecked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: COLORS.text }}>
                          {lead.userName || "Unnamed Lead"}
                        </p>
                        <p className="text-[10px]" style={{ color: COLORS.muted }}>
                          {lead.mobileNumber}
                        </p>
                      </div>
                    </div>
                    {lead.status && (
                      <span className="rounded-md px-2 py-0.5 text-[9px] font-medium bg-gray-100 text-gray-600">
                        {lead.status}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Audience Summary Card */}
      <div className="flex items-center justify-between rounded-2xl border p-4 bg-blue-50/40" style={{ borderColor: "#BFDBFE" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: COLORS.text }}>
              Target Audience Summary
            </p>
            <p className="text-[11px]" style={{ color: COLORS.muted }}>
              {loadingLeads ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Calculating recipient count...
                </span>
              ) : (
                `Ready to receive campaign`
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-extrabold text-blue-600">
            {loadingLeads ? "..." : recipientCount.toLocaleString()}
          </span>
          <span className="block text-[10px] font-medium text-gray-500">Recipients</span>
        </div>
      </div>

      {recipientCount === 0 && !loadingLeads && (
        <div className="flex items-center gap-2 rounded-xl p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Warning: 0 leads found for this selection. Please select an audience with valid phone numbers.</span>
        </div>
      )}
    </div>
  );
}
