"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Radio,
  Plus,
  Loader2,
  Send,
  Clock,
  CheckCheck,
  XCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import {
  Broadcast,
  BroadcastStatus,
  getBroadcastHistory,
} from "@/core/api/broadcastApi";
import { COLORS } from "@/core/components/theme/colors";
import NewBroadcastModal from "./NewBroadcastModal";

const POLL_MS = 5_000;

function statusConfig(status: BroadcastStatus) {
  switch (status) {
    case "draft":
      return { label: "Draft", color: "#64748b", bg: "rgba(100,116,139,0.12)", pulse: false };
    case "running":
      return { label: "Sending…", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", pulse: true };
    case "completed":
      return { label: "Completed", color: "#22c55e", bg: "rgba(34,197,94,0.12)", pulse: false };
    case "failed":
      return { label: "Failed", color: "#ef4444", bg: "rgba(239,68,68,0.12)", pulse: false };
    case "cancelled":
      return { label: "Cancelled", color: "#6b7280", bg: "rgba(107,114,128,0.12)", pulse: false };
    default:
      return { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.12)", pulse: false };
  }
}

function pct(a: number, b: number) {
  return b > 0 ? Math.round((a / b) * 100) : 0;
}

export default function BroadcastsPage() {
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    try {
      const { broadcasts: data } = await getBroadcastHistory(1, 50);
      setBroadcasts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load broadcasts";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const anySending = useMemo(() => broadcasts.some((b) => b.status === "running"), [broadcasts]);

  useEffect(() => {
    function start() {
      if (pollRef.current) return;
      pollRef.current = setInterval(load, POLL_MS);
    }
    function stop() {
      if (!pollRef.current) return;
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    function onVisibility() {
      if (!anySending) return;
      document.visibilityState === "hidden" ? stop() : (load(), start());
    }
    if (anySending && document.visibilityState === "visible") start();
    else stop();
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [anySending]);

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar for running broadcasts */}
      {anySending && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-gray-200">
          <div
            className="h-full animate-[slide_1.6s_ease-in-out_infinite]"
            style={{ width: "33%", backgroundColor: COLORS.primary }}
          />
          <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
            Broadcasts
          </h1>
          <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
            Send bulk WhatsApp messages to your contacts using approved templates.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "#D1D5DB", color: COLORS.muted }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Plus className="h-4 w-4" />
            New Broadcast
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: COLORS.primary }} />
        </div>
      ) : broadcasts.length === 0 ? (
        <EmptyState onNew={() => setNewOpen(true)} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-wide"
            style={{ color: COLORS.muted, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}
          >
            <span>Campaign</span>
            <span className="hidden sm:block text-right">Recipients</span>
            <span className="hidden md:block text-right">Sent</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="divide-y divide-gray-100">
            {broadcasts.map((bc) => {
              const cfg = statusConfig(bc.status);
              return (
                <li
                  key={bc.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-blue-50/40"
                  onClick={() => router.push(`/broadcasts/${bc.id}`)}
                >
                  {/* Name + template */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: COLORS.text }}>
                      {bc.campaignName}
                    </p>
                    <p className="truncate text-xs mt-0.5" style={{ color: COLORS.muted }}>
                      {bc.templateName} · {new Date(bc.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Recipients */}
                  <div className="hidden sm:flex items-center gap-1.5 text-sm tabular-nums" style={{ color: COLORS.muted }}>
                    <Send className="h-3.5 w-3.5 opacity-60" />
                    {bc.totalRecipients.toLocaleString()}
                  </div>

                  {/* Sent % bar */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full transition-[width] duration-500"
                        style={{
                          width: `${pct(bc.sentCount, bc.totalRecipients)}%`,
                          backgroundColor: COLORS.primary,
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums" style={{ color: COLORS.muted }}>
                      {pct(bc.sentCount, bc.totalRecipients)}%
                    </span>
                  </div>

                  {/* Status badge */}
                  <div
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ color: cfg.color, backgroundColor: cfg.bg }}
                  >
                    {cfg.pulse && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <span
                          className="relative inline-flex h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                      </span>
                    )}
                    {cfg.label}
                  </div>

                  <ChevronRight className="h-4 w-4 opacity-30" />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* New broadcast modal */}
      <NewBroadcastModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={() => { setNewOpen(false); load(); }}
      />
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div
      className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed gap-3"
      style={{ borderColor: "#D1D5DB" }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${COLORS.primary}18` }}
      >
        <Radio className="h-7 w-7" style={{ color: COLORS.primary }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: COLORS.text }}>No broadcasts yet</p>
        <p className="mt-1 text-xs" style={{ color: COLORS.muted }}>
          Create your first broadcast to reach contacts at scale.
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Plus className="h-4 w-4" />
        New Broadcast
      </button>
    </div>
  );
}
