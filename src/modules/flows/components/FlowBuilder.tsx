"use client";

/**
 * FlowBuilder.tsx — List/accordion view of a flow's nodes.
 * Ported from whatsapp_crm/src/components/flows/flow-builder.tsx.
 * Each node renders as an expandable card with NodeConfigForm inside.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useFlowEditor } from "./flow-editor-state";
import { NodeConfigForm } from "./NodeConfigForm";
import { NodeIconChip, nodeColors, NODE_META, groupNodeTypesByCategory, summarizeNode, type NodeType, type BuilderNode } from "./shared";

const ADD_NODE_TYPES: NodeType[] = [
  "start", "send_message", "send_buttons", "send_list", "send_media",
  "collect_input", "condition", "set_tag", "handoff", "end",
];

export function FlowBuilder() {
  const { state, setState, addNode, updateNodeConfig, removeNode, flashKey } = useFlowEditor();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [prevFlashKey, setPrevFlashKey] = useState<string | null | undefined>(null);
  if (flashKey !== prevFlashKey) {
    setPrevFlashKey(flashKey);
    if (flashKey) {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        next.add(flashKey);
        return next;
      });
    }
  }

  // Flash effect — scroll to node
  useEffect(() => {
    if (!flashKey) return;
    // Delay scroll slightly to allow the node expansion to render first
    const timer = setTimeout(() => {
      const el = nodeRefs.current[flashKey];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [flashKey]);

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAddNode = (type: NodeType) => {
    const key = addNode(type);
    setExpandedKeys((prev) => new Set([...prev, key]));
    setShowAddMenu(false);
    // Scroll to bottom after render
    setTimeout(() => {
      const el = nodeRefs.current[key];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSetEntry = (key: string) => {
    setState((s) => ({ ...s, entry_node_id: key }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, padding: "20px 0" }}>
      {/* Trigger config */}
      <TriggerPanel />

      <div style={{ height: 1, background: "#e2e8f0", margin: "16px 0" }} />

      {/* Nodes */}
      {state.nodes.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0", fontSize: 14 }}>
          No nodes yet — add one below to build your flow.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {state.nodes.map((node) => (
            <NodeCard
              key={node.node_key}
              node={node}
              allNodes={state.nodes}
              isEntry={node.node_key === state.entry_node_id}
              isExpanded={expandedKeys.has(node.node_key)}
              isFlashed={node.node_key === flashKey}
              onToggle={() => toggleExpanded(node.node_key)}
              onUpdateConfig={(patch) => updateNodeConfig(node.node_key, patch)}
              onDelete={() => removeNode(node.node_key)}
              onSetEntry={() => handleSetEntry(node.node_key)}
              ref={(el: HTMLDivElement | null) => { nodeRefs.current[node.node_key] = el; }}
            />
          ))}
        </div>
      )}

      {/* Add node */}
      <div style={{ marginTop: 20, position: "relative", display: "inline-block" }}>
        <button
          onClick={() => setShowAddMenu((v) => !v)}
          style={{
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 18 }}>+</span> Add node
        </button>
        {showAddMenu && (
          <AddNodeMenu onSelect={handleAddNode} onClose={() => setShowAddMenu(false)} />
        )}
      </div>
    </div>
  );
}

// ─── Node card ───────────────────────────────────────────────────────────────

const NodeCard = ({
  node, allNodes, isEntry, isExpanded, isFlashed,
  onToggle, onUpdateConfig, onDelete, onSetEntry, ref,
}: {
  node: BuilderNode;
  allNodes: BuilderNode[];
  isEntry: boolean;
  isExpanded: boolean;
  isFlashed: boolean;
  onToggle: () => void;
  onUpdateConfig: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onSetEntry: () => void;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const c = nodeColors(node.node_type);
  const meta = NODE_META[node.node_type];
  const summary = summarizeNode(node);

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      style={{
        border: `1.5px solid ${isFlashed ? "#f59e0b" : isExpanded ? c.border : "#e2e8f0"}`,
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
        boxShadow: isFlashed ? `0 0 0 3px rgba(245,158,11,0.25)` : isExpanded ? `0 0 0 2px ${c.ring}` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          cursor: "pointer",
          userSelect: "none",
          background: isExpanded ? `${c.bg}80` : "transparent",
        }}
      >
        <NodeIconChip type={node.node_type} size={32} iconSize={16} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {meta.label}
            </span>
            {isEntry && (
              <span style={{ fontSize: 9, fontWeight: 700, background: "#d1fae5", color: "#065f46", borderRadius: 4, padding: "1px 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Entry
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>
            {node.node_key}
          </div>
          {summary && !isExpanded && (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {summary}
            </div>
          )}
        </div>
        <span style={{ color: "#94a3b8", fontSize: 16, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </div>

      {/* Body */}
      {isExpanded && (
        <div style={{ padding: "4px 16px 16px", borderTop: `1px solid ${c.ring}`, display: "flex", flexDirection: "column", gap: 12 }}>
          <NodeConfigForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />
          <div style={{ display: "flex", gap: 8, marginTop: 4, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
            {!isEntry && (
              <button
                onClick={onSetEntry}
                style={{ fontSize: 12, color: "#4f46e5", background: "#eef2ff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}
              >
                Set as entry
              </button>
            )}
            <button
              onClick={onDelete}
              style={{ fontSize: 12, color: "#ef4444", background: "#fef2f2", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 600, marginLeft: "auto" }}
            >
              Delete node
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Trigger panel ────────────────────────────────────────────────────────────

function TriggerPanel() {
  const { state, setState } = useFlowEditor();
  const keywords = (state.trigger_config.keywords as string[] | undefined) ?? [];
  const [kw, setKw] = useState("");

  const addKeyword = () => {
    const trimmed = kw.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setState((s) => ({ ...s, trigger_config: { ...s.trigger_config, keywords: [...keywords, trimmed] } }));
    }
    setKw("");
  };
  const removeKeyword = (k: string) => {
    setState((s) => ({ ...s, trigger_config: { ...s.trigger_config, keywords: keywords.filter((x) => x !== k) } }));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 13,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={labelStyle}>Trigger type</label>
        <select
          value={state.trigger_type}
          onChange={(e) => setState((s) => ({ ...s, trigger_type: e.target.value as typeof s.trigger_type, trigger_config: {} }))}
          style={inputStyle}
        >
          <option value="keyword">Keyword match</option>
          <option value="first_inbound_message">First inbound message</option>
          <option value="manual">Manual (via API)</option>
        </select>
      </div>

      {state.trigger_type === "keyword" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={labelStyle}>Keywords</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              placeholder="Type a keyword and press Enter"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={addKeyword} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {keywords.map((k) => (
              <span key={k} style={{ background: "#eef2ff", color: "#4f46e5", borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                {k}
                <button onClick={() => removeKeyword(k)} style={{ background: "none", border: "none", cursor: "pointer", color: "#818cf8", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {state.trigger_type === "first_inbound_message" && (
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>This flow starts automatically when a lead sends their very first WhatsApp message to your number.</p>
      )}
      {state.trigger_type === "manual" && (
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>This flow is only started via API. It won&#39;t auto-trigger from inbound messages.</p>
      )}
    </div>
  );
}

// ─── Add node menu ─────────────────────────────────────────────────────────────

function AddNodeMenu({ onSelect, onClose }: { onSelect: (t: NodeType) => void; onClose: () => void }) {
  const groups = groupNodeTypesByCategory(ADD_NODE_TYPES);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
      <div
        style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: 0,
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          zIndex: 50,
          minWidth: 260,
          overflow: "hidden",
        }}
      >
        {groups.map((group, gi) => (
          <div key={group.id}>
            {gi > 0 && <div style={{ height: 1, background: "#f1f5f9" }} />}
            <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {group.label}
            </div>
            {group.types.map((type) => {
              const meta = NODE_META[type];
              const c = nodeColors(type);
              return (
                <button
                  key={type}
                  onClick={() => onSelect(type)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <NodeIconChip type={type} size={28} iconSize={14} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{meta.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{meta.blurb}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
