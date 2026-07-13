"use client";

import { useFlowEditor } from "./flow-editor-state";

export function FlowEditorHeader({
  viewMode,
  setViewMode,
}: {
  viewMode: "canvas" | "list";
  setViewMode: (v: "canvas" | "list") => void;
}) {
  const { state, setState, dirty, saving, save, setStatus, activating, deleteCurrentFlow } = useFlowEditor();

  const handleStatusToggle = async () => {
    if (state.status === "active") {
      await setStatus("draft");
    } else {
      await setStatus("active");
    }
  };

  const statusColors = {
    active: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
    draft: { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" },
    archived: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  };

  const sc = statusColors[state.status] || statusColors.draft;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <input
          type="text"
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          placeholder="Unnamed Flow"
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#1e293b",
            border: "none",
            outline: "none",
            background: "none",
            padding: 0,
            margin: 0,
            width: "auto",
            minWidth: 120,
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            background: sc.bg,
            color: sc.text,
            border: `1px solid ${sc.border}`,
            borderRadius: 6,
            padding: "2px 8px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {state.status}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* View mode toggle */}
        <div
          style={{
            display: "inline-flex",
            background: "#f1f5f9",
            borderRadius: 8,
            padding: 2,
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={() => setViewMode("canvas")}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: viewMode === "canvas" ? "#fff" : "transparent",
              color: viewMode === "canvas" ? "#1e293b" : "#64748b",
              boxShadow: viewMode === "canvas" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Canvas
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: viewMode === "list" ? "#fff" : "transparent",
              color: viewMode === "list" ? "#1e293b" : "#64748b",
              boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            List
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={deleteCurrentFlow}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          Delete
        </button>

        {/* Save button */}
        <button
          onClick={save}
          disabled={!dirty || saving}
          style={{
            background: dirty ? "#4f46e5" : "#f1f5f9",
            color: dirty ? "#fff" : "#94a3b8",
            border: `1px solid ${dirty ? "#4f46e5" : "#cbd5e1"}`,
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: dirty ? "pointer" : "default",
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {/* Toggle Status */}
        <button
          onClick={handleStatusToggle}
          disabled={activating}
          style={{
            background: state.status === "active" ? "#fee2e2" : "#d1fae5",
            color: state.status === "active" ? "#991b1b" : "#065f46",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {activating ? "Processing..." : state.status === "active" ? "Pause Flow" : "Activate"}
        </button>
      </div>
    </header>
  );
}
