"use client";

import { useState } from "react";
import { FlowEditorProvider } from "./flow-editor-state";
import { FlowEditorHeader } from "./FlowEditorHeader";
import { FlowBuilder } from "./FlowBuilder";
import { FlowCanvas } from "./FlowCanvas";
import { ValidationPanel } from "./ValidationPanel";
import { type Flow, type FlowNode } from "@/core/api/flowApi";

export function FlowEditorShell({
  initialFlow,
  initialNodes,
}: {
  initialFlow: Flow;
  initialNodes: FlowNode[];
}) {
  const [viewMode, setViewMode] = useState<"canvas" | "list">("canvas");

  return (
    <FlowEditorProvider initialFlow={initialFlow} initialNodes={initialNodes}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 120px)",
          borderRadius: 16,
          background: "#fff",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          position: "relative",
        }}
      >
        <FlowEditorHeader viewMode={viewMode} setViewMode={setViewMode} />

        <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
          {/* Main workspace */}
          <div style={{ flex: 1, height: "100%", overflowY: viewMode === "list" ? "auto" : "hidden", position: "relative" }}>
            {viewMode === "list" ? (
              <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
                <FlowBuilder />
              </div>
            ) : (
              <FlowCanvas />
            )}
          </div>

          {/* Sidebar validation */}
          <ValidationPanel />
        </div>
      </div>
    </FlowEditorProvider>
  );
}
