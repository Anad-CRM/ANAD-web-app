"use client";

import { useFlowEditor } from "./flow-editor-state";


export function ValidationPanel() {
  const { issues, requestFlash } = useFlowEditor();

  if (issues.length === 0) {
    return (
      <div
        style={{
          width: 320,
          background: "#fff",
          borderLeft: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Validation</h3>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            color: "#10b981",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 12 }}>All checks passed!</div>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
            This flow has no issues and is safe to activate.
          </p>
        </div>
      </div>
    );
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  return (
    <div
      style={{
        width: 320,
        background: "#fff",
        borderLeft: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Validation Issues</h3>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>
          {errors.length} error{errors.length === 1 ? "" : "s"} · {warnings.length} warning
          {warnings.length === 1 ? "" : "s"}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {issues.map((issue, idx) => {
          const isError = issue.severity === "error";
          const color = isError ? "#ef4444" : "#f59e0b";
          const bg = isError ? "#fef2f2" : "#fffbeb";
          const border = isError ? "#fee2e2" : "#fef3c7";

          return (
            <div
              key={idx}
              onClick={() => issue.node_key && requestFlash(issue.node_key)}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 8,
                padding: "10px 12px",
                cursor: issue.node_key ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: color,
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {issue.severity}
                </span>
                {issue.node_key && (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "#64748b",
                      marginLeft: "auto",
                    }}
                  >
                    {issue.node_key}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#1e293b", lineHeight: 1.4 }}>
                {issue.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
