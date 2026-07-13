"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Users, Send, AlertCircle, Clock, Download, Search, RefreshCw } from "lucide-react";
import {
  Broadcast,
  BroadcastRecipient,
  getBroadcastHistory,
  getBroadcastRecipients,
} from "@/core/api/broadcastApi";
import { COLORS } from "@/core/components/theme/colors";

function pct(a: number, b: number) {
  return b > 0 ? Math.round((a / b) * 100) : 0;
}

export default function BroadcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const broadcastId = params.id as string;

  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering and searching
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      // Since there is no single broadcast endpoint, fetch the list and find this one
      const { broadcasts } = await getBroadcastHistory(1, 100);
      const found = broadcasts.find((b) => b.id === broadcastId);
      if (found) {
        setBroadcast(found);
      } else {
        // If not found in the first 100, try to construct a minimal version or error out
        // but we'll default to error.
        setError("Broadcast campaign not found.");
      }

      // Fetch recipients
      const recs = await getBroadcastRecipients(broadcastId);
      setRecipients(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load details");
    } finally {
      setLoading(false);
    }
  }, [broadcastId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute stat counts from recipients list (as the DB counts might not be updated instantly)
  const stats = useMemo(() => {
    const total = recipients.length;
    const sent = recipients.filter((r) => r.status === "sent").length;
    const failed = recipients.filter((r) => r.status === "failed").length;
    const pending = recipients.filter((r) => r.status === "pending").length;
    return { total, sent, failed, pending };
  }, [recipients]);

  // Filtered recipients
  const filteredRecipients = useMemo(() => {
    return recipients.filter((r) => {
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      
      const phoneMatch = r.phoneNumber.includes(searchQuery);
      const name = r.lead?.userName || "";
      const nameMatch = name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && (phoneMatch || nameMatch);
    });
  }, [recipients, statusFilter, searchQuery]);

  // CSV Export
  const handleExport = () => {
    if (!broadcast) return;

    const headers = ["Lead Name", "Phone Number", "Status", "Sent At", "Error Message"];
    const rows = recipients.map((r) => [
      r.lead?.userName || "Unknown",
      r.phoneNumber,
      r.status,
      r.sentAt ? new Date(r.sentAt).toLocaleString() : "-",
      r.errorMessage || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `broadcast_${broadcast.campaignName.replace(/\s+/g, "_")}_recipients.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: COLORS.primary }} />
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold" style={{ color: COLORS.danger }}>
          {error || "Broadcast campaign not found"}
        </p>
        <button
          onClick={() => router.push("/broadcasts")}
          className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold hover:bg-gray-200 transition-colors"
          style={{ color: COLORS.text }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Broadcasts
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/broadcasts")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#D1D5DB" }}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: COLORS.text }} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
                {broadcast.campaignName}
              </h1>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase"
                style={{
                  backgroundColor:
                    broadcast.status === "completed"
                      ? "rgba(34, 197, 94, 0.12)"
                      : broadcast.status === "running"
                      ? "rgba(245, 158, 11, 0.12)"
                      : "rgba(100, 116, 139, 0.12)",
                  color:
                    broadcast.status === "completed"
                      ? "#22c55e"
                      : broadcast.status === "running"
                      ? "#f59e0b"
                      : "#64748b",
                }}
              >
                {broadcast.status}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
              Template: <span className="font-semibold">{broadcast.templateName}</span> · Created: {new Date(broadcast.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "#D1D5DB", color: COLORS.muted }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={recipients.length === 0}
            className="flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: "#D1D5DB", color: COLORS.text }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border p-4 shadow-sm bg-white" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: COLORS.muted }}>Total Recipients</span>
            <Users className="h-4 w-4 opacity-50" />
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: COLORS.text }}>{stats.total.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm bg-white" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: COLORS.muted }}>Delivered / Sent</span>
            <Send className="h-4 w-4 text-green-500 opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: COLORS.text }}>{stats.sent.toLocaleString()}</p>
          <span className="text-[10px] block mt-0.5 text-green-600 font-semibold">{pct(stats.sent, stats.total)}% success rate</span>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm bg-white" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: COLORS.muted }}>Failed</span>
            <AlertCircle className="h-4 w-4 text-red-500 opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: COLORS.text }}>{stats.failed.toLocaleString()}</p>
          <span className="text-[10px] block mt-0.5 text-red-600 font-semibold">{pct(stats.failed, stats.total)}% failure rate</span>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm bg-white" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: COLORS.muted }}>Pending</span>
            <Clock className="h-4 w-4 text-yellow-500 opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: COLORS.text }}>{stats.pending.toLocaleString()}</p>
          <span className="text-[10px] block mt-0.5 text-yellow-600 font-semibold">{pct(stats.pending, stats.total)}% remaining</span>
        </div>
      </div>

      {/* Recipients List Card */}
      <div className="rounded-3xl border bg-white overflow-hidden shadow-sm" style={{ borderColor: COLORS.border }}>
        {/* Filters bar */}
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-2">
            {["all", "sent", "failed", "pending"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all capitalize"
                style={{
                  backgroundColor: statusFilter === filter ? `${COLORS.primary}12` : "transparent",
                  color: statusFilter === filter ? COLORS.primary : COLORS.muted,
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full max-w-[260px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-40" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none"
              style={{ borderColor: "#D1D5DB" }}
            />
          </div>
        </div>

        {/* Table */}
        {filteredRecipients.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-semibold" style={{ color: COLORS.text }}>No recipients found</p>
            <p className="text-xs mt-1" style={{ color: COLORS.muted }}>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", color: COLORS.muted }}>
                  <th className="px-6 py-3.5">Lead / Contact</th>
                  <th className="px-6 py-3.5">Phone Number</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Sent At</th>
                  <th className="px-6 py-3.5">Error Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecipients.map((rec) => (
                  <tr key={rec.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold" style={{ color: COLORS.text }}>
                        {rec.lead?.userName || "Unknown Contact"}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs" style={{ color: COLORS.muted }}>
                      {rec.phoneNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
                        style={{
                          backgroundColor:
                            rec.status === "sent"
                              ? "rgba(34, 197, 94, 0.1)"
                              : rec.status === "failed"
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(245, 158, 11, 0.1)",
                          color:
                            rec.status === "sent"
                              ? "#22c55e"
                              : rec.status === "failed"
                              ? "#ef4444"
                              : "#f59e0b",
                        }}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs" style={{ color: COLORS.muted }}>
                      {rec.sentAt ? new Date(rec.sentAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-xs text-red-500 max-w-xs truncate" title={rec.errorMessage || ""}>
                      {rec.errorMessage || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
