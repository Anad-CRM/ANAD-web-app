"use client";

/**
 * flow-editor-state.tsx — Single source of truth for the flow editor.
 * Ported from whatsapp_crm/src/components/flows/flow-editor-state.tsx.
 * Replaces Supabase fetch calls with axios via flowApi.ts.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { updateFlow, deleteFlow, setFlowStatus, type Flow, type FlowNode } from "@/core/api/flowApi";
import { validateFlowForActivation, type ValidationIssue } from "../utils/validate";
import { slugify, type BuilderNode, type NodeType } from "./shared";

// ─── State shape ─────────────────────────────────────────────────────────────

export interface BuilderState {
  name: string;
  description: string;
  trigger_type: "keyword" | "first_inbound_message" | "manual";
  trigger_config: Record<string, unknown>;
  entry_node_id: string | null;
  status: Flow["status"];
  nodes: BuilderNode[];
}

// ─── Context value ────────────────────────────────────────────────────────────

export interface FlowEditorContextValue {
  flow: Flow;
  state: BuilderState;
  setState: (u: BuilderState | ((prev: BuilderState) => BuilderState)) => void;
  dirty: boolean;
  saving: boolean;
  activating: boolean;
  issues: ValidationIssue[];
  canActivate: boolean;

  addNode: (type: NodeType) => string;
  updateNode: (key: string, patch: Partial<BuilderNode>) => void;
  updateNodeConfig: (key: string, patch: Record<string, unknown>) => void;
  updateNodePosition: (key: string, x: number, y: number) => void;
  updateNodePositions: (positions: Record<string, { x: number; y: number }>) => void;
  removeNode: (key: string) => void;

  save: () => Promise<void>;
  setStatus: (status: BuilderState["status"]) => Promise<void>;
  deleteCurrentFlow: () => Promise<void>;

  flashKey: string | null;
  requestFlash: (key: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function uniqueNodeKey(base: string, existing: BuilderNode[]): string {
  if (!existing.some((n) => n.node_key === base)) return base;
  let i = 2;
  while (existing.some((n) => n.node_key === `${base}_${i}`)) i += 1;
  return `${base}_${i}`;
}

export function defaultConfigFor(type: NodeType): Record<string, unknown> {
  switch (type) {
    case "start":         return { next_node_key: "" };
    case "send_message":  return { text: "", next_node_key: "" };
    case "send_buttons":  return { text: "", buttons: [{ reply_id: "yes", title: "Yes", next_node_key: "" }] };
    case "send_list":
      return {
        text: "",
        button_label: "View options",
        sections: [{ title: "", rows: [{ reply_id: "row_1", title: "Option 1", next_node_key: "" }] }],
      };
    case "send_media":    return { media_type: "image", media_url: "", caption: "", next_node_key: "" };
    case "collect_input": return { prompt_text: "", var_key: "answer", next_node_key: "" };
    case "condition":     return { subject: "var", subject_key: "", operator: "equals", value: "", true_next: "", false_next: "" };
    case "set_tag":       return { mode: "add", tag_id: "", next_node_key: "" };
    case "handoff":       return { note: "" };
    case "end":           return {};
  }
}

const NODE_LABEL: Record<NodeType, string> = {
  start: "start", send_message: "message", send_buttons: "buttons",
  send_list: "list", send_media: "media", collect_input: "input",
  condition: "condition", set_tag: "tag", handoff: "handoff", end: "end",
};

// ─── Context ──────────────────────────────────────────────────────────────────

const FlowEditorCtx = createContext<FlowEditorContextValue | null>(null);

export function useFlowEditor(): FlowEditorContextValue {
  const ctx = useContext(FlowEditorCtx);
  if (!ctx) throw new Error("useFlowEditor must be called inside <FlowEditorProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ProviderProps {
  initialFlow: Flow;
  initialNodes: FlowNode[];
  children: ReactNode;
}

export function FlowEditorProvider({ initialFlow, initialNodes, children }: ProviderProps) {
  const router = useRouter();

  const [state, setStateRaw] = useState<BuilderState>(() => ({
    name: initialFlow.name,
    description: initialFlow.description ?? "",
    trigger_type: initialFlow.trigger_type,
    trigger_config: initialFlow.trigger_config as Record<string, unknown>,
    entry_node_id: initialFlow.entry_node_id,
    status: initialFlow.status,
    nodes: initialNodes.map((n) => ({
      node_key: n.node_key,
      node_type: n.node_type,
      config: n.config as Record<string, unknown>,
      position_x: n.position_x,
      position_y: n.position_y,
    })),
  }));

  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const toast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const setState = useCallback<typeof setStateRaw>((u) => {
    setDirty(true);
    setStateRaw(u);
  }, []);

  // beforeunload guard
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Flash signal
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestFlash = useCallback((key: string) => {
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    setFlashKey(key);
    flashTimeoutRef.current = setTimeout(() => { setFlashKey(null); flashTimeoutRef.current = null; }, 1600);
  }, []);
  useEffect(() => () => { if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current); }, []);

  // Validation
  const issues = useMemo<ValidationIssue[]>(() =>
    validateFlowForActivation(
      { name: state.name, trigger_type: state.trigger_type, trigger_config: state.trigger_config, entry_node_id: state.entry_node_id },
      state.nodes
    ),
    [state]
  );
  const canActivate = useMemo(() => issues.every((i) => i.severity !== "error"), [issues]);

  // ─── Save ──────────────────────────────────────────────────────────────────

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await updateFlow(initialFlow.id, {
        name: state.name,
        description: state.description || null,
        trigger_type: state.trigger_type,
        trigger_config: state.trigger_config,
        entry_node_id: state.entry_node_id,
        nodes: state.nodes,
      });
      setDirty(false);
      toast("Flow saved");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }, [initialFlow.id, state, toast]);

  // ─── Status ────────────────────────────────────────────────────────────────

  const setStatusFn = useCallback(async (next: BuilderState["status"]) => {
    if (next === "active" && !canActivate) {
      toast("Fix validation errors before activating", "error");
      return;
    }
    setActivating(true);
    try {
      if (next === "active") await save();
      await setFlowStatus(initialFlow.id, next);
      setStateRaw((s) => ({ ...s, status: next }));
      toast(next === "active" ? "Flow activated!" : next === "archived" ? "Flow archived" : "Flow paused");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Status update failed", "error");
    } finally {
      setActivating(false);
    }
  }, [canActivate, save, initialFlow.id, toast]);

  // ─── Delete ────────────────────────────────────────────────────────────────

  const deleteCurrentFlow = useCallback(async () => {
    const yes = window.confirm(`Delete "${state.name}"? Any active runs end immediately. This can't be undone.`);
    if (!yes) return;
    try {
      await deleteFlow(initialFlow.id);
      router.push("/flows");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }, [initialFlow.id, router, state.name, toast]);

  // ─── Node mutations ────────────────────────────────────────────────────────

  const updateNode = useCallback((key: string, patch: Partial<BuilderNode>) => {
    setState((s) => ({ ...s, nodes: s.nodes.map((n) => n.node_key === key ? { ...n, ...patch } : n) }));
  }, [setState]);

  const updateNodeConfig = useCallback((key: string, configPatch: Record<string, unknown>) => {
    setState((s) => ({
      ...s,
      nodes: s.nodes.map((n) => n.node_key === key ? { ...n, config: { ...n.config, ...configPatch } } : n),
    }));
  }, [setState]);

  const updateNodePosition = useCallback((key: string, x: number, y: number) => {
    setState((s) => ({
      ...s,
      nodes: s.nodes.map((n) => n.node_key === key ? { ...n, position_x: Math.round(x), position_y: Math.round(y) } : n),
    }));
  }, [setState]);

  const updateNodePositions = useCallback((positions: Record<string, { x: number; y: number }>) => {
    setStateRaw((s) => ({
      ...s,
      nodes: s.nodes.map((n) => {
        const pos = positions[n.node_key];
        return pos ? { ...n, position_x: Math.round(pos.x), position_y: Math.round(pos.y) } : n;
      }),
    }));
  }, []);

  const addNode = useCallback((type: NodeType): string => {
    const base = slugify(NODE_LABEL[type] ?? type, type);
    let createdKey = base;
    setState((s) => {
      const node_key = uniqueNodeKey(base, s.nodes);
      createdKey = node_key;
      const next: BuilderNode = { node_key, node_type: type, config: defaultConfigFor(type) };
      return {
        ...s,
        nodes: [...s.nodes, next],
        entry_node_id: s.entry_node_id ?? (type === "start" ? node_key : null),
      };
    });
    return createdKey;
  }, [setState]);

  const removeNode = useCallback((key: string) => {
    setState((s) => {
      const remaining = s.nodes.filter((n) => n.node_key !== key);
      // Clear dangling references
      const cleaned = remaining.map((n) => {
        const cfg = { ...n.config };
        if (cfg.next_node_key === key) cfg.next_node_key = "";
        if (cfg.true_next === key) cfg.true_next = "";
        if (cfg.false_next === key) cfg.false_next = "";
        if (Array.isArray(cfg.buttons)) {
          cfg.buttons = (cfg.buttons as Array<Record<string, unknown>>).map((b) =>
            b.next_node_key === key ? { ...b, next_node_key: "" } : b
          );
        }
        if (Array.isArray(cfg.sections)) {
          cfg.sections = (cfg.sections as Array<Record<string, unknown>>).map((sec) => ({
            ...sec,
            rows: Array.isArray(sec.rows)
              ? (sec.rows as Array<Record<string, unknown>>).map((r) =>
                  r.next_node_key === key ? { ...r, next_node_key: "" } : r
                )
              : sec.rows,
          }));
        }
        return { ...n, config: cfg };
      });
      return { ...s, nodes: cleaned, entry_node_id: s.entry_node_id === key ? null : s.entry_node_id };
    });
  }, [setState]);

  const value = useMemo<FlowEditorContextValue>(() => ({
    flow: initialFlow,
    state,
    setState,
    dirty,
    saving,
    activating,
    issues,
    canActivate,
    addNode,
    updateNode,
    updateNodeConfig,
    updateNodePosition,
    updateNodePositions,
    removeNode,
    save,
    setStatus: setStatusFn,
    deleteCurrentFlow,
    flashKey,
    requestFlash,
  }), [
    initialFlow, state, setState, dirty, saving, activating, issues, canActivate,
    addNode, updateNode, updateNodeConfig, updateNodePosition, updateNodePositions,
    removeNode, save, setStatusFn, deleteCurrentFlow, flashKey, requestFlash,
  ]);

  return (
    <FlowEditorCtx.Provider value={value}>
      {children}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: toastMsg.type === "error" ? "#ef4444" : "#10b981",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            zIndex: 9999,
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          }}
        >
          {toastMsg.text}
        </div>
      )}
    </FlowEditorCtx.Provider>
  );
}
