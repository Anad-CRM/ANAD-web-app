"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, Search, Check, Loader2, AlertCircle, Upload, FileText, Trash2, Plus } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { LEAD_STATUSES } from "@/modules/broadcasts/constants/broadcastConstants";
import { api } from "@/core/api/axios";

interface LeadItem {
  id: string;
  userName?: string | null;
  mobileNumber?: string | null;
  status?: string | null;
}

export interface CsvContact {
  phone: string;
  name?: string;
}

interface StepAudienceProps {
  audienceType: string;
  onAudienceTypeChange: (val: string) => void;
  selectedLeadIds: string[];
  onSelectedLeadIdsChange: (ids: string[]) => void;
  csvContacts: CsvContact[];
  onCsvContactsChange: (contacts: CsvContact[]) => void;
}

/**
 * Step 2 — Target audience selection (Status Filter, Specific Leads, or CSV/Manual Numbers).
 */
export function StepAudience({
  audienceType,
  onAudienceTypeChange,
  selectedLeadIds,
  onSelectedLeadIdsChange,
  csvContacts,
  onCsvContactsChange,
}: StepAudienceProps) {
  const [mode, setMode] = useState<"status" | "specific" | "csv">(
    audienceType === "selected" ? "specific" : audienceType === "csv" ? "csv" : "status"
  );
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rawTextInput, setRawTextInput] = useState("");

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

  // Valid leads filter
  const validLeads = useMemo(() => {
    return leads.filter(
      (l) => l.mobileNumber && String(l.mobileNumber).trim() !== "" && String(l.mobileNumber).trim() !== "N/A"
    );
  }, [leads]);

  const recipientCount = useMemo(() => {
    if (mode === "csv") {
      return csvContacts.length;
    }
    if (mode === "specific") {
      return selectedLeadIds.length;
    }
    if (audienceType === "all") {
      return validLeads.length;
    }
    return validLeads.filter((l) => l.status === audienceType).length;
  }, [mode, audienceType, selectedLeadIds, validLeads, csvContacts]);

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

  // Helper to parse text lines into phone numbers
  const parsePhoneText = (text: string): CsvContact[] => {
    const lines = text.split(/[\n,;]+/);
    const parsed: CsvContact[] = [];
    const seen = new Set<string>();

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Extract phone & optional name if separated by comma/tab
      const parts = trimmed.split(/[\t,|]+/);
      let phone = parts[0].trim().replace(/[^\d+]/g, "");
      const name = parts[1]?.trim();

      if (phone.length >= 7 && !seen.has(phone)) {
        seen.add(phone);
        parsed.push({ phone, name });
      }
    });

    return parsed;
  };

  // Handle CSV / TXT file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parsePhoneText(content);
        // Merge with existing csvContacts
        const combined = [...csvContacts];
        const seen = new Set(combined.map((c) => c.phone));
        parsed.forEach((item) => {
          if (!seen.has(item.phone)) {
            seen.add(item.phone);
            combined.push(item);
          }
        });
        onCsvContactsChange(combined);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Add numbers from raw text input area
  const handleAddRawInput = () => {
    if (!rawTextInput.trim()) return;
    const parsed = parsePhoneText(rawTextInput);
    const combined = [...csvContacts];
    const seen = new Set(combined.map((c) => c.phone));
    parsed.forEach((item) => {
      if (!seen.has(item.phone)) {
        seen.add(item.phone);
        combined.push(item);
      }
    });
    onCsvContactsChange(combined);
    setRawTextInput("");
  };

  const handleRemoveCsvItem = (index: number) => {
    onCsvContactsChange(csvContacts.filter((_, idx) => idx !== index));
  };

  const handleClearAllCsv = () => {
    onCsvContactsChange([]);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
          Target Audience Selection
        </label>
        <div className="flex gap-1 rounded-xl border bg-gray-50 p-1" style={{ borderColor: "#E5E7EB" }}>
          <button
            type="button"
            onClick={() => {
              setMode("status");
              if (audienceType === "selected" || audienceType === "csv") onAudienceTypeChange("all");
            }}
            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
            style={{
              backgroundColor: mode === "status" ? "white" : "transparent",
              color: mode === "status" ? COLORS.primary : COLORS.muted,
              boxShadow: mode === "status" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Lead Status Filter
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
            Select Leads ({selectedLeadIds.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("csv");
              onAudienceTypeChange("csv");
            }}
            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1"
            style={{
              backgroundColor: mode === "csv" ? "white" : "transparent",
              color: mode === "csv" ? COLORS.primary : COLORS.muted,
              boxShadow: mode === "csv" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <Upload className="h-3.5 w-3.5" />
            CSV / Add Numbers ({csvContacts.length})
          </button>
        </div>
      </div>

      {/* ── Mode 1: Status Filter ────────────────────────── */}
      {mode === "status" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs" style={{ color: COLORS.muted }}>
            Select which lead status category should receive this WhatsApp broadcast.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-0.5">
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
      )}

      {/* ── Mode 2: Specific Leads Picker ───────────────── */}
      {mode === "specific" && (
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

          <div className="flex flex-col gap-1.5 max-h-[230px] overflow-y-auto border rounded-xl p-2 bg-gray-50/50" style={{ borderColor: "#E5E7EB" }}>
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

      {/* ── Mode 3: CSV File Upload / Raw Numbers ────────── */}
      {mode === "csv" && (
        <div className="flex flex-col gap-3">
          {/* File Upload Dropzone */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center bg-gray-50/60 transition-colors hover:bg-gray-50 border-gray-300">
            <Upload className="h-6 w-6 text-blue-500 mb-1" />
            <p className="text-xs font-semibold" style={{ color: COLORS.text }}>
              Upload CSV or TXT File
            </p>
            <p className="text-[10px] text-gray-400 mb-2">
              File should contain phone numbers (e.g. +1234567890) or comma-separated Name, Phone
            </p>
            <label className="cursor-pointer rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
              Browse File
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Paste Raw Numbers */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold flex items-center justify-between" style={{ color: COLORS.text }}>
              <span>Or Paste / Type Phone Numbers</span>
              <span className="text-[10px] font-normal text-gray-400">(Line by line or comma separated)</span>
            </label>
            <div className="flex gap-2">
              <textarea
                placeholder={`+1234567890\n+9876543210, John Doe`}
                rows={2}
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs focus:border-blue-500 focus:outline-none resize-none bg-white"
                style={{ borderColor: "#D1D5DB" }}
              />
              <button
                type="button"
                onClick={handleAddRawInput}
                disabled={!rawTextInput.trim()}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 self-end"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          </div>

          {/* Parsed Contacts List */}
          {csvContacts.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                  Added Recipients ({csvContacts.length})
                </span>
                <button
                  type="button"
                  onClick={handleClearAllCsv}
                  className="text-[11px] font-semibold text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Clear All
                </button>
              </div>

              <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto rounded-xl border p-2 bg-gray-50" style={{ borderColor: "#E5E7EB" }}>
                {csvContacts.map((contact, idx) => (
                  <div
                    key={`${contact.phone}-${idx}`}
                    className="flex items-center justify-between rounded-lg bg-white p-2 border text-xs"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      <span className="font-semibold text-gray-800">{contact.phone}</span>
                      {contact.name && (
                        <span className="text-[10px] text-gray-400">({contact.name})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCsvItem(idx)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              {loadingLeads && mode !== "csv" ? (
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
            {loadingLeads && mode !== "csv" ? "..." : recipientCount.toLocaleString()}
          </span>
          <span className="block text-[10px] font-medium text-gray-500">Recipients</span>
        </div>
      </div>

      {recipientCount === 0 && !loadingLeads && (
        <div className="flex items-center gap-2 rounded-xl p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Warning: 0 recipients added. Please upload a CSV file, paste phone numbers, or choose a lead category.</span>
        </div>
      )}
    </div>
  );
}
