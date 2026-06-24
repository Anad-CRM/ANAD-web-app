"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Loader2, User, Phone, Mail, Calendar, Tag, RefreshCw, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/core/api/axios";
import { leadsApi } from "@/modules/leads/api/leadsApi";
import { Lead, LeadStatus } from "@/modules/leads/types/lead.types";
import { COLORS } from "@/core/components/theme/colors";
import { useRouter } from "next/navigation";

// Define the 5 Kanban columns
interface Column {
  id: string;
  title: string;
  color: string;
  bg: string;
  // The lead statuses that map to this column
  statuses: LeadStatus[];
  // Default status to assign when a card is dropped here
  defaultStatus: LeadStatus;
}

const COLUMNS: Column[] = [
  {
    id: "new",
    title: "New Leads",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.06)",
    statuses: ["New Lead"],
    defaultStatus: "New Lead",
  },
  {
    id: "contacted",
    title: "Contacted / Active",
    color: "#D97706",
    bg: "rgba(217,119,6,0.06)",
    statuses: ["Contacted", "Busy", "RNR"],
    defaultStatus: "Contacted",
  },
  {
    id: "followup",
    title: "Follow Up",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.06)",
    statuses: ["Follow Up"],
    defaultStatus: "Follow Up",
  },
  {
    id: "qualified",
    title: "Qualified",
    color: "#0D9488",
    bg: "rgba(13,148,136,0.06)",
    statuses: ["Hot Lead", "Register", "Enrolled"],
    defaultStatus: "Hot Lead",
  },
  {
    id: "won",
    title: "Won / Deals",
    color: "#16A34A",
    bg: "rgba(22,163,74,0.06)",
    statuses: ["Closed", "Customer"],
    defaultStatus: "Closed",
  },
];

export default function WaPipelinePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<"whatsapp" | "all">("whatsapp");
  
  // Drawer state for lead detail view
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingLead, setUpdatingLead] = useState(false);
  const [leadRemark, setLeadRemark] = useState("");
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("New Lead");

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await leadsApi.fetchLeads({ limit: 150 });
      if (response.status === "success" || Array.isArray(response.data)) {
        setLeads(response.data || []);
      } else {
        toast.error("Failed to load pipeline leads");
      }
    } catch {
      toast.error("Error fetching leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Filter leads by source
  const filteredLeads = useMemo(() => {
    if (filterSource === "whatsapp") {
      return leads.filter((l) => l.source?.toLowerCase() === "whatsapp");
    }
    return leads;
  }, [leads, filterSource]);

  // Handle HTML5 drag and drop
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    const targetColumn = COLUMNS.find((c) => c.id === columnId);
    if (!targetColumn) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || targetColumn.statuses.includes(lead.status)) return;

    // Optimistically update status in UI
    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: targetColumn.defaultStatus } : l))
    );

    try {
      await api.post("/lead/update/LeadStatus", {
        leadId,
        status: targetColumn.defaultStatus,
      });
      toast.success(`Lead moved to ${targetColumn.title}`);
    } catch {
      // Revert UI on error
      setLeads(previousLeads);
      toast.error("Failed to update lead status");
    }
  };

  // Open lead details in drawer
  const handleCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadRemark(lead.remark || "");
    setLeadStatus(lead.status);
    setDrawerOpen(true);
  };

  const handleUpdateLeadDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setUpdatingLead(true);
    try {
      // Update Status if changed
      if (leadStatus !== selectedLead.status) {
        await api.post("/lead/update/LeadStatus", {
          leadId: selectedLead.id,
          status: leadStatus,
        });
      }

      // Update lead details/remark (we make a call to lead edit or activity creation)
      // Since backend has standard updateLead or createActivity:
      // Let's call leadsApi.createActivity if remark changed
      if (leadRemark !== selectedLead.remark) {
        await api.post(`/lead/update/LeadStatus`, {
          leadId: selectedLead.id,
          remark: leadRemark,
        });
      }

      toast.success("Lead details updated!");
      setDrawerOpen(false);
      loadLeads();
    } catch {
      toast.error("Failed to update lead details");
    } finally {
      setUpdatingLead(false);
    }
  };

  // Group leads by column
  const columnsData = useMemo(() => {
    const data: Record<string, Lead[]> = {
      new: [],
      contacted: [],
      followup: [],
      qualified: [],
      won: [],
    };

    filteredLeads.forEach((lead) => {
      const col = COLUMNS.find((c) => c.statuses.includes(lead.status));
      if (col) {
        data[col.id].push(lead);
      } else {
        // Default unmapped statuses to contacted
        data.contacted.push(lead);
      }
    });

    return data;
  }, [filteredLeads]);

  return (
    <div className="flex flex-col gap-6 h-full min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
            WhatsApp Pipeline Kanban
          </h1>
          <p className="text-sm" style={{ color: COLORS.muted }}>
            Drag and drop WhatsApp leads between stages to progress your deals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setFilterSource("whatsapp")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all`}
              style={{
                backgroundColor: filterSource === "whatsapp" ? "white" : "transparent",
                color: filterSource === "whatsapp" ? COLORS.primary : COLORS.muted,
                boxShadow: filterSource === "whatsapp" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              WhatsApp Only
            </button>
            <button
              onClick={() => setFilterSource("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all`}
              style={{
                backgroundColor: filterSource === "all" ? "white" : "transparent",
                color: filterSource === "all" ? COLORS.primary : COLORS.muted,
                boxShadow: filterSource === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              All Sources
            </button>
          </div>

          <button
            onClick={loadLeads}
            className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white hover:bg-gray-50 transition-colors"
            style={{ borderColor: "#D1D5DB" }}
          >
            <RefreshCw className="h-4.5 w-4.5" style={{ color: COLORS.muted }} />
          </button>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: COLORS.primary }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const list = columnsData[column.id] || [];
            return (
              <div
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                className="flex flex-col rounded-2xl p-3 min-w-[220px] max-h-[70vh] overflow-y-auto"
                style={{ backgroundColor: column.bg }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                    <h3 className="text-sm font-bold" style={{ color: COLORS.text }}>
                      {column.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold shadow-sm" style={{ color: COLORS.muted }}>
                    {list.length}
                  </span>
                </div>

                {/* Card List */}
                <div className="flex flex-col gap-2.5">
                  {list.length === 0 ? (
                    <div className="flex h-20 items-center justify-center rounded-xl border border-dashed text-center p-2 text-xs" style={{ color: COLORS.muted, borderColor: "#CBD5E1" }}>
                      Drop leads here
                    </div>
                  ) : (
                    list.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => handleCardClick(lead)}
                        className="flex flex-col rounded-xl border bg-white p-3.5 shadow-sm transition-all hover:shadow cursor-pointer hover:border-gray-300 active:scale-[0.98] select-none"
                        style={{ borderColor: COLORS.border }}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-sm font-bold truncate flex-1" style={{ color: COLORS.text }}>
                            {lead.userName || lead.name || "Unknown Lead"}
                          </p>
                          {lead.source?.toLowerCase() === "whatsapp" && (
                            <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                              WA
                            </span>
                          )}
                        </div>
                        
                        <p className="mt-1 text-xs font-mono" style={{ color: COLORS.muted }}>
                          {lead.mobileNumber || lead.mobile || "-"}
                        </p>

                        <div className="flex items-center justify-between mt-3.5 pt-2 border-t" style={{ borderColor: "#F1F5F9" }}>
                          <span className="text-[10px]" style={{ color: COLORS.subtle }}>
                            {new Date(lead.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                          <span className="text-[10px] font-semibold" style={{ color: column.color }}>
                            {lead.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side Slide-Over Details Drawer */}
      {drawerOpen && selectedLead && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: "rgba(13,27,62,0.3)", backdropFilter: "blur(2px)" }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-5" style={{ borderColor: "#E5E7EB" }}>
                <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                  Lead Details
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                  style={{ color: COLORS.muted }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Lead Info Form */}
              <form onSubmit={handleUpdateLeadDetails} className="flex flex-col gap-4">
                {/* Info Card */}
                <div className="rounded-2xl border p-4 bg-gray-50/50 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4.5 w-4.5 opacity-50" />
                    <div>
                      <p className="text-xs" style={{ color: COLORS.muted }}>Name</p>
                      <p className="text-sm font-semibold" style={{ color: COLORS.text }}>{selectedLead.userName || selectedLead.name || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4.5 w-4.5 opacity-50" />
                    <div>
                      <p className="text-xs" style={{ color: COLORS.muted }}>Phone</p>
                      <p className="text-sm font-semibold font-mono" style={{ color: COLORS.text }}>{selectedLead.mobileNumber || selectedLead.mobile || "-"}</p>
                    </div>
                  </div>

                  {selectedLead.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4.5 w-4.5 opacity-50" />
                      <div>
                        <p className="text-xs" style={{ color: COLORS.muted }}>Email</p>
                        <p className="text-sm font-semibold" style={{ color: COLORS.text }}>{selectedLead.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Tag className="h-4.5 w-4.5 opacity-50" />
                    <div>
                      <p className="text-xs" style={{ color: COLORS.muted }}>Source</p>
                      <p className="text-sm font-semibold capitalize" style={{ color: COLORS.text }}>{selectedLead.source || "Manual"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4.5 w-4.5 opacity-50" />
                    <div>
                      <p className="text-xs" style={{ color: COLORS.muted }}>Created At</p>
                      <p className="text-sm font-semibold" style={{ color: COLORS.text }}>{new Date(selectedLead.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Edit Fields */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                    Pipeline Stage / Status
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                    className="rounded-xl border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    style={{ borderColor: "#D1D5DB", backgroundColor: "white" }}
                  >
                    {COLUMNS.flatMap((c) => c.statuses).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                    Notes / Remarks
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add a remark for this lead..."
                    value={leadRemark}
                    onChange={(e) => setLeadRemark(e.target.value)}
                    className="rounded-xl border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-4">
              {selectedLead.source?.toLowerCase() === "whatsapp" && (
                <button
                  onClick={() => {
                    // Navigate to chat inbox and select this user
                    setDrawerOpen(false);
                    router.push(`/inbox?chat=${selectedLead.mobileNumber || selectedLead.mobile}`);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  style={{ color: COLORS.text }}
                >
                  <MessageSquare className="h-4 w-4" style={{ color: COLORS.primary }} />
                  Open WhatsApp Chat
                </button>
              )}
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  style={{ color: COLORS.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLeadDetails}
                  disabled={updatingLead}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {updatingLead && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
