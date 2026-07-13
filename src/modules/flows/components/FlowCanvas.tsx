"use client";

/**
 * FlowCanvas.tsx — React Flow canvas view.
 * Ported from whatsapp_crm/src/components/flows/flow-canvas.tsx.
 * Drag nodes, draw edges by dragging handles, delete with Backspace/Delete.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Node as RfNode,
  type Edge as RfEdge,
  type NodeChange,
  type NodeProps,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useFlowEditor } from "./flow-editor-state";
import { NodeConfigForm } from "./NodeConfigForm";
import { NodeIconChip, nodeColors, NODE_META, summarizeNode, type BuilderNode, type NodeType } from "./shared";

// ─── Outgoing edge helpers (ported from edges.ts) ─────────────────────────────

function outgoingSlots(node: BuilderNode): { id: string; label: string }[] {
  switch (node.node_type) {
    case "start":
    case "send_message":
    case "send_media":
    case "collect_input":
    case "set_tag":
      return [{ id: "next", label: "Next" }];
    case "send_buttons": {
      const buttons = (node.config.buttons as Array<{ reply_id: string; title: string }> | undefined) ?? [];
      return buttons.map((b) => ({ id: b.reply_id, label: b.title || b.reply_id }));
    }
    case "send_list": {
      const sections = (node.config.sections as Array<{ rows: Array<{ reply_id: string; title: string }> }> | undefined) ?? [];
      const rows: { id: string; label: string }[] = [];
      for (const s of sections) {
        for (const r of s.rows ?? []) {
          rows.push({ id: r.reply_id, label: r.title || r.reply_id });
        }
      }
      return rows;
    }
    case "condition":
      return [{ id: "true", label: "True ✓" }, { id: "false", label: "False ✗" }];
    case "handoff":
    case "end":
      return [];
    default:
      return [];
  }
}

function deriveEdges(nodes: BuilderNode[]): { id: string; source: string; target: string; sourceHandle: string; label: string }[] {
  const edges: { id: string; source: string; target: string; sourceHandle: string; label: string }[] = [];
  for (const n of nodes) {
    switch (n.node_type) {
      case "start":
      case "send_message":
      case "send_media":
      case "collect_input":
      case "set_tag": {
        const target = (n.config.next_node_key as string) ?? "";
        if (target) edges.push({ id: `${n.node_key}->next`, source: n.node_key, target, sourceHandle: "next", label: "" });
        break;
      }
      case "send_buttons": {
        const buttons = (n.config.buttons as Array<{ reply_id: string; title: string; next_node_key: string }>) ?? [];
        for (const b of buttons) {
          if (b.next_node_key) {
            edges.push({ id: `${n.node_key}->${b.reply_id}`, source: n.node_key, target: b.next_node_key, sourceHandle: b.reply_id, label: b.title });
          }
        }
        break;
      }
      case "send_list": {
        const sections = (n.config.sections as Array<{ rows: Array<{ reply_id: string; title: string; next_node_key: string }> }>) ?? [];
        for (const s of sections) {
          for (const r of s.rows ?? []) {
            if (r.next_node_key) {
              edges.push({ id: `${n.node_key}->${r.reply_id}`, source: n.node_key, target: r.next_node_key, sourceHandle: r.reply_id, label: r.title });
            }
          }
        }
        break;
      }
      case "condition": {
        const cfg = n.config as { true_next?: string; false_next?: string };
        if (cfg.true_next) edges.push({ id: `${n.node_key}->true`, source: n.node_key, target: cfg.true_next, sourceHandle: "true", label: "True" });
        if (cfg.false_next) edges.push({ id: `${n.node_key}->false`, source: n.node_key, target: cfg.false_next, sourceHandle: "false", label: "False" });
        break;
      }
    }
  }
  return edges;
}

function applyEdgeConnectionPatch(node: BuilderNode, sourceHandle: string, target: string): Record<string, unknown> | null {
  switch (node.node_type) {
    case "start": case "send_message": case "send_media": case "collect_input": case "set_tag":
      return { next_node_key: target };
    case "condition":
      if (sourceHandle === "true") return { true_next: target };
      if (sourceHandle === "false") return { false_next: target };
      return null;
    case "send_buttons": {
      const buttons = (node.config.buttons as Array<{ reply_id: string; next_node_key: string }>) ?? [];
      const updated = buttons.map((b) => b.reply_id === sourceHandle ? { ...b, next_node_key: target } : b);
      return { buttons: updated };
    }
    case "send_list": {
      const sections = (node.config.sections as Array<{ rows: Array<{ reply_id: string; next_node_key: string }> }>) ?? [];
      const updated = sections.map((s) => ({
        ...s,
        rows: (s.rows ?? []).map((r) => r.reply_id === sourceHandle ? { ...r, next_node_key: target } : r),
      }));
      return { sections: updated };
    }
    default:
      return null;
  }
}

// ─── Custom node card ─────────────────────────────────────────────────────────

interface NodeData extends Record<string, unknown> {
  node: BuilderNode;
  isEntry: boolean;
  isFlashed: boolean;
}

function FlowNodeCard({ data, selected }: NodeProps) {
  const { node, isEntry, isFlashed } = data as NodeData;
  const c = nodeColors(node.node_type);
  const meta = NODE_META[node.node_type];
  const slots = outgoingSlots(node);
  const isMultiSlot = slots.length > 1;
  const hasTarget = node.node_type !== "start";
  const summary = summarizeNode(node);

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${selected ? c.border : isFlashed ? "#f59e0b" : "#e2e8f0"}`,
        borderRadius: 12,
        minWidth: 220,
        maxWidth: 260,
        padding: "10px 14px",
        boxShadow: selected ? `0 0 0 2px ${c.ring}, 0 8px 24px -4px ${c.ring}` : isFlashed ? "0 0 0 3px rgba(245,158,11,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
    >
      {hasTarget && (
        <Handle type="target" position={Position.Left} style={{ background: "#fff", border: `2px solid ${c.ring}`, width: 10, height: 10 }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <NodeIconChip type={node.node_type} size={24} iconSize={12} />
        <span style={{ fontSize: 10, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {meta.label}
        </span>
        {isEntry && (
          <span style={{ marginLeft: "auto", fontSize: 8, fontWeight: 700, background: "#d1fae5", color: "#065f46", borderRadius: 3, padding: "1px 5px", textTransform: "uppercase" }}>
            Entry
          </span>
        )}
      </div>

      <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", marginBottom: summary ? 4 : 0 }}>
        {node.node_key}
      </div>

      {summary && (
        <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {summary}
        </div>
      )}

      {isMultiSlot && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 4 }}>
          {slots.map((slot) => (
            <div key={slot.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "#64748b" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{slot.label}</span>
              <Handle
                type="source"
                id={slot.id}
                position={Position.Right}
                style={{ background: "#fff", border: `2px solid ${c.border}`, width: 10, height: 10, position: "relative", right: "auto", top: "auto", transform: "none" }}
              />
            </div>
          ))}
        </div>
      )}

      {!isMultiSlot && slots.length === 1 && (
        <Handle
          type="source"
          id={slots[0].id}
          position={Position.Right}
          style={{ background: "#fff", border: `2px solid ${c.border}`, width: 10, height: 10 }}
        />
      )}
    </div>
  );
}

const NODE_TYPES = { flow: FlowNodeCard };
const NODE_W = 240, NODE_H = 90;

// ─── Simple dagre-less layout (left-to-right, stacked) ────────────────────────
// We skip dagre import complexity and use a simple grid layout for new flows.
// Flows that already have position_x/position_y use those.

function needsLayout(nodes: BuilderNode[]): boolean {
  return nodes.every((n) => !n.position_x && !n.position_y);
}

function simpleLayout(nodes: BuilderNode[]): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => {
    result[n.node_key] = { x: (i % 3) * (NODE_W + 60), y: Math.floor(i / 3) * (NODE_H + 60) };
  });
  return result;
}

// ─── Inner canvas ─────────────────────────────────────────────────────────────

function FlowCanvasInner() {
  const { state, setState, updateNodeConfig, updateNodePosition, updateNodePositions, removeNode, addNode, flashKey } = useFlowEditor();
  const reactFlow = useReactFlow();
  const builderNodes = state.nodes;
  const entryNodeId = state.entry_node_id;

  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => selectedNodeKey ? (builderNodes.find((n) => n.node_key === selectedNodeKey) ?? null) : null,
    [selectedNodeKey, builderNodes]
  );

  // Layout on first render for all-zero flows
  const didLayout = useRef(false);
  useEffect(() => {
    if (didLayout.current || !needsLayout(builderNodes) || builderNodes.length === 0) return;
    didLayout.current = true;
    updateNodePositions(simpleLayout(builderNodes));
  }, [builderNodes, updateNodePositions]);

  // Pan to flashed node
  useEffect(() => {
    if (!flashKey) return;
    const node = builderNodes.find((n) => n.node_key === flashKey);
    if (!node) return;
    reactFlow.setCenter((node.position_x ?? 0) + NODE_W / 2, (node.position_y ?? 0) + NODE_H / 2, { zoom: reactFlow.getZoom(), duration: 400 });
  }, [flashKey, builderNodes, reactFlow]);

  const rfNodes = useMemo<RfNode<NodeData>[]>(() =>
    builderNodes.map((n) => ({
      id: n.node_key,
      type: "flow",
      position: { x: n.position_x ?? 0, y: n.position_y ?? 0 },
      data: { node: n, isEntry: n.node_key === entryNodeId, isFlashed: n.node_key === flashKey },
    })),
    [builderNodes, entryNodeId, flashKey]
  );

  const [rfNodesState, setRfNodesState] = useState<RfNode<NodeData>[]>(rfNodes);
  useEffect(() => { setRfNodesState(rfNodes); }, [rfNodes]);

  const rfEdges = useMemo<RfEdge[]>(() =>
    deriveEdges(builderNodes).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      label: e.label,
      labelStyle: { fill: "#64748b", fontSize: 10 },
      labelBgStyle: { fill: "#fff" },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
      style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
    })),
    [builderNodes]
  );

  const handleNodesChange = useCallback((changes: NodeChange<RfNode<NodeData>>[]) => {
    setRfNodesState((nodes) => applyNodeChanges(changes, nodes));
  }, []);

  const handleNodeDragStop = useCallback<OnNodeDrag<RfNode<NodeData>>>((_e, node) => {
    updateNodePosition(node.id, node.position.x, node.position.y);
  }, [updateNodePosition]);

  const handleNodeClick = useCallback((_e: React.MouseEvent, node: RfNode<NodeData>) => {
    setSelectedNodeKey(node.id);
  }, []);

  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle) return;
    if (connection.source === connection.target) return;
    const sourceNode = builderNodes.find((n) => n.node_key === connection.source);
    if (!sourceNode) return;
    const patch = applyEdgeConnectionPatch(sourceNode, connection.sourceHandle, connection.target);
    if (patch) updateNodeConfig(connection.source, patch);
  }, [builderNodes, updateNodeConfig]);

  const handleNodesDelete = useCallback((deleted: RfNode<NodeData>[]) => {
    for (const n of deleted) {
      removeNode(n.id);
      if (selectedNodeKey === n.id) setSelectedNodeKey(null);
    }
  }, [removeNode, selectedNodeKey]);

  const handleEdgesDelete = useCallback((deleted: RfEdge[]) => {
    for (const e of deleted) {
      if (!e.sourceHandle) continue;
      const sourceNode = builderNodes.find((n) => n.node_key === e.source);
      if (!sourceNode) continue;
      const patch = applyEdgeConnectionPatch(sourceNode, e.sourceHandle, "");
      if (patch) updateNodeConfig(e.source, patch);
    }
  }, [builderNodes, updateNodeConfig]);

  const handleAddNode = (type: NodeType) => {
    const key = addNode(type);
    const root = document.querySelector(".react-flow") as HTMLElement | null;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const center = reactFlow.screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    updateNodePosition(key, center.x - NODE_W / 2, center.y - NODE_H / 2);
  };

  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <>
      <div style={{ height: "100%", width: "100%" }}>
        <ReactFlow
          nodes={rfNodesState}
          edges={rfEdges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
          proOptions={{ hideAttribution: true }}
          onNodesChange={handleNodesChange}
          onNodeDragStop={handleNodeDragStop}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
          onNodesDelete={handleNodesDelete}
          onEdgesDelete={handleEdgesDelete}
          deleteKeyCode={["Backspace", "Delete"]}
          nodesConnectable
          edgesFocusable
          elementsSelectable
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="#e2e8f0" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable nodeStrokeWidth={0} nodeBorderRadius={3} />
          <Panel position="top-left" style={{ top: 12, left: 12 }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowAddMenu((v) => !v)}
                style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(79,70,229,0.4)" }}
              >
                <span style={{ fontSize: 18 }}>+</span> Add node
              </button>
              {showAddMenu && (
                <>
                  <div onClick={() => setShowAddMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                  <CanvasNodeMenu onSelect={(t) => { handleAddNode(t); setShowAddMenu(false); }} />
                </>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Side panel */}
      {selectedNode && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 340,
            height: "100%",
            background: "#fff",
            borderLeft: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
            <NodeIconChip type={selectedNode.node_type} size={32} iconSize={16} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: nodeColors(selectedNode.node_type).text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {NODE_META[selectedNode.node_type].label}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{selectedNode.node_key}</div>
            </div>
            <button onClick={() => setSelectedNodeKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
            <NodeConfigForm
              node={selectedNode}
              allNodes={builderNodes}
              onUpdateConfig={(patch) => updateNodeConfig(selectedNode.node_key, patch)}
            />
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
            {selectedNode.node_key !== entryNodeId ? (
              <button
                onClick={() => setState((s) => ({ ...s, entry_node_id: selectedNode.node_key }))}
                style={{ fontSize: 12, color: "#4f46e5", background: "#eef2ff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}
              >
                Set as entry
              </button>
            ) : <span />}
            <button
              onClick={() => { removeNode(selectedNode.node_key); setSelectedNodeKey(null); }}
              style={{ fontSize: 12, color: "#ef4444", background: "#fef2f2", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}
            >
              Delete node
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Canvas node menu ─────────────────────────────────────────────────────────

function CanvasNodeMenu({ onSelect }: { onSelect: (t: NodeType) => void }) {
  const types: NodeType[] = ["start", "send_message", "send_buttons", "send_list", "send_media", "collect_input", "condition", "set_tag", "handoff", "end"];
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        zIndex: 50,
        minWidth: 240,
        overflow: "hidden",
      }}
    >
      {types.map((type) => {
        const meta = NODE_META[type];
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
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
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
