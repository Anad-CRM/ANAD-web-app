"use client";

/**
 * NodeConfigForm.tsx — Per-node configuration form.
 * Each node type renders its own input fields.
 * Calls onUpdateConfig with a partial config patch on each change.
 */

import { type BuilderNode, type NodeType } from "./shared";

interface Props {
  node: BuilderNode;
  allNodes: BuilderNode[];
  onUpdateConfig: (patch: Record<string, unknown>) => void;
}

// ─── Field primitives ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#1e293b",
  background: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "#64748b",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function NodeKeySelect({
  value,
  allNodes,
  selfKey,
  onChange,
}: {
  value: string;
  allNodes: BuilderNode[];
  selfKey: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    >
      <option value="">— pick a node —</option>
      {allNodes
        .filter((n) => n.node_key !== selfKey)
        .map((n) => (
          <option key={n.node_key} value={n.node_key}>
            {n.node_key} ({n.node_type})
          </option>
        ))}
    </select>
  );
}

// ─── Per-type forms ─────────────────────────────────────────────────────────

function StartForm({ node, allNodes, onUpdateConfig }: Props) {
  return (
    <Field label="Next node">
      <NodeKeySelect
        value={(node.config.next_node_key as string) ?? ""}
        allNodes={allNodes}
        selfKey={node.node_key}
        onChange={(v) => onUpdateConfig({ next_node_key: v })}
      />
    </Field>
  );
}

function SendMessageForm({ node, allNodes, onUpdateConfig }: Props) {
  return (
    <>
      <Field label="Message text">
        <textarea
          value={(node.config.text as string) ?? ""}
          rows={4}
          onChange={(e) => onUpdateConfig({ text: e.target.value })}
          placeholder="Type your message here… Use {{vars.name}} to interpolate."
          style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
        />
      </Field>
      <Field label="Next node">
        <NodeKeySelect
          value={(node.config.next_node_key as string) ?? ""}
          allNodes={allNodes}
          selfKey={node.node_key}
          onChange={(v) => onUpdateConfig({ next_node_key: v })}
        />
      </Field>
    </>
  );
}

function SendButtonsForm({ node, allNodes, onUpdateConfig }: Props) {
  const buttons = (node.config.buttons as Array<{ reply_id: string; title: string; next_node_key: string }>) ?? [];

  const updateButton = (i: number, patch: Record<string, string>) => {
    const updated = buttons.map((b, idx) => (idx === i ? { ...b, ...patch } : b));
    onUpdateConfig({ buttons: updated });
  };
  const addButton = () => {
    if (buttons.length >= 3) return;
    onUpdateConfig({ buttons: [...buttons, { reply_id: `opt_${buttons.length + 1}`, title: "", next_node_key: "" }] });
  };
  const removeButton = (i: number) => {
    onUpdateConfig({ buttons: buttons.filter((_, idx) => idx !== i) });
  };

  return (
    <>
      <Field label="Message body">
        <textarea
          value={(node.config.text as string) ?? ""}
          rows={3}
          onChange={(e) => onUpdateConfig({ text: e.target.value })}
          placeholder="What would you like to do?"
          style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
        />
      </Field>
      <Field label="Footer (optional)">
        <input
          type="text"
          value={(node.config.footer_text as string) ?? ""}
          onChange={(e) => onUpdateConfig({ footer_text: e.target.value })}
          placeholder="Tap a button to continue"
          style={inputStyle}
        />
      </Field>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={labelStyle}>Buttons (max 3)</label>
        {buttons.map((b, i) => (
          <div
            key={i}
            style={{ background: "#f1f5f9", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8, position: "relative" }}
          >
            <button
              onClick={() => removeButton(i)}
              style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16 }}
            >×</button>
            <Field label={`Button ${i + 1} — reply id`}>
              <input
                type="text"
                value={b.reply_id}
                onChange={(e) => updateButton(i, { reply_id: e.target.value })}
                placeholder="e.g. option_1"
                style={inputStyle}
              />
            </Field>
            <Field label="Label (max 20 chars)">
              <input
                type="text"
                value={b.title}
                maxLength={20}
                onChange={(e) => updateButton(i, { title: e.target.value })}
                placeholder="Button label"
                style={inputStyle}
              />
            </Field>
            <Field label="Goes to">
              <NodeKeySelect
                value={b.next_node_key}
                allNodes={allNodes}
                selfKey={node.node_key}
                onChange={(v) => updateButton(i, { next_node_key: v })}
              />
            </Field>
          </div>
        ))}
        {buttons.length < 3 && (
          <button
            onClick={addButton}
            style={{ alignSelf: "flex-start", background: "#e0e7ff", color: "#4f46e5", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            + Add button
          </button>
        )}
      </div>
    </>
  );
}

function SendListForm({ node, allNodes, onUpdateConfig }: Props) {
  const sections = (node.config.sections as Array<{ title: string; rows: Array<{ reply_id: string; title: string; description?: string; next_node_key: string }> }>) ?? [];

  const updateRow = (si: number, ri: number, patch: Record<string, string>) => {
    const updated = sections.map((s, sIdx) =>
      sIdx === si
        ? { ...s, rows: s.rows.map((r, rIdx) => (rIdx === ri ? { ...r, ...patch } : r)) }
        : s
    );
    onUpdateConfig({ sections: updated });
  };
  const addRow = (si: number) => {
    const updated = sections.map((s, sIdx) =>
      sIdx === si
        ? { ...s, rows: [...s.rows, { reply_id: `row_${s.rows.length + 1}`, title: "", next_node_key: "" }] }
        : s
    );
    onUpdateConfig({ sections: updated });
  };
  const removeRow = (si: number, ri: number) => {
    const updated = sections.map((s, sIdx) =>
      sIdx === si ? { ...s, rows: s.rows.filter((_, rIdx) => rIdx !== ri) } : s
    );
    onUpdateConfig({ sections: updated });
  };
  const addSection = () => {
    onUpdateConfig({ sections: [...sections, { title: "", rows: [{ reply_id: `row_1`, title: "", next_node_key: "" }] }] });
  };

  return (
    <>
      <Field label="Message body">
        <textarea
          value={(node.config.text as string) ?? ""}
          rows={3}
          onChange={(e) => onUpdateConfig({ text: e.target.value })}
          placeholder="What can I help you with?"
          style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
        />
      </Field>
      <Field label="Button label">
        <input
          type="text"
          value={(node.config.button_label as string) ?? ""}
          onChange={(e) => onUpdateConfig({ button_label: e.target.value })}
          placeholder="View options"
          style={inputStyle}
        />
      </Field>

      <label style={labelStyle}>Sections & rows</label>
      {sections.map((section, si) => (
        <div key={si} style={{ background: "#f1f5f9", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
          <Field label={`Section ${si + 1} title (optional)`}>
            <input
              type="text"
              value={section.title ?? ""}
              onChange={(e) => {
                const updated = sections.map((s, sIdx) => sIdx === si ? { ...s, title: e.target.value } : s);
                onUpdateConfig({ sections: updated });
              }}
              placeholder="Section heading"
              style={inputStyle}
            />
          </Field>
          {section.rows.map((row, ri) => (
            <div key={ri} style={{ background: "#fff", borderRadius: 6, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
              <button onClick={() => removeRow(si, ri)} style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16 }}>×</button>
              <Field label="Reply ID">
                <input type="text" value={row.reply_id} onChange={(e) => updateRow(si, ri, { reply_id: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Title (max 24 chars)">
                <input type="text" value={row.title} maxLength={24} onChange={(e) => updateRow(si, ri, { title: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Goes to">
                <NodeKeySelect value={row.next_node_key} allNodes={allNodes} selfKey={node.node_key} onChange={(v) => updateRow(si, ri, { next_node_key: v })} />
              </Field>
            </div>
          ))}
          <button onClick={() => addRow(si)} style={{ alignSelf: "flex-start", background: "#e0e7ff", color: "#4f46e5", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add row</button>
        </div>
      ))}
      <button onClick={addSection} style={{ alignSelf: "flex-start", background: "#e0e7ff", color: "#4f46e5", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        + Add section
      </button>
    </>
  );
}

function SendMediaForm({ node, allNodes, onUpdateConfig }: Props) {
  return (
    <>
      <Field label="Media type">
        <select
          value={(node.config.media_type as string) ?? "image"}
          onChange={(e) => onUpdateConfig({ media_type: e.target.value })}
          style={inputStyle}
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="document">Document</option>
        </select>
      </Field>
      <Field label="Media URL">
        <input
          type="url"
          value={(node.config.media_url as string) ?? ""}
          onChange={(e) => onUpdateConfig({ media_url: e.target.value })}
          placeholder="https://example.com/image.jpg"
          style={inputStyle}
        />
      </Field>
      <Field label="Caption (optional)">
        <input
          type="text"
          value={(node.config.caption as string) ?? ""}
          onChange={(e) => onUpdateConfig({ caption: e.target.value })}
          style={inputStyle}
        />
      </Field>
      {(node.config.media_type as string) === "document" && (
        <Field label="Filename">
          <input
            type="text"
            value={(node.config.filename as string) ?? ""}
            onChange={(e) => onUpdateConfig({ filename: e.target.value })}
            style={inputStyle}
          />
        </Field>
      )}
      <Field label="Next node">
        <NodeKeySelect
          value={(node.config.next_node_key as string) ?? ""}
          allNodes={allNodes}
          selfKey={node.node_key}
          onChange={(v) => onUpdateConfig({ next_node_key: v })}
        />
      </Field>
    </>
  );
}

function CollectInputForm({ node, allNodes, onUpdateConfig }: Props) {
  return (
    <>
      <Field label="Prompt text">
        <textarea
          value={(node.config.prompt_text as string) ?? ""}
          rows={3}
          onChange={(e) => onUpdateConfig({ prompt_text: e.target.value })}
          placeholder="What's your name? Use {{vars.prev_answer}} to reference earlier captures."
          style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
        />
      </Field>
      <Field label="Save response as var_key">
        <input
          type="text"
          value={(node.config.var_key as string) ?? ""}
          onChange={(e) => onUpdateConfig({ var_key: e.target.value })}
          placeholder="name"
          style={inputStyle}
        />
      </Field>
      <Field label="Next node">
        <NodeKeySelect
          value={(node.config.next_node_key as string) ?? ""}
          allNodes={allNodes}
          selfKey={node.node_key}
          onChange={(v) => onUpdateConfig({ next_node_key: v })}
        />
      </Field>
    </>
  );
}

function ConditionForm({ node, allNodes, onUpdateConfig }: Props) {
  const subject = (node.config.subject as string) ?? "var";
  const operator = (node.config.operator as string) ?? "equals";
  return (
    <>
      <Field label="Subject type">
        <select value={subject} onChange={(e) => onUpdateConfig({ subject: e.target.value })} style={inputStyle}>
          <option value="var">Variable (vars.*)</option>
          <option value="contact_field">Contact field</option>
        </select>
      </Field>
      <Field label={subject === "var" ? "Variable name" : "Field name"}>
        <input
          type="text"
          value={(node.config.subject_key as string) ?? ""}
          onChange={(e) => onUpdateConfig({ subject_key: e.target.value })}
          placeholder={subject === "var" ? "e.g. email" : "name / email / phone / company"}
          style={inputStyle}
        />
      </Field>
      <Field label="Operator">
        <select value={operator} onChange={(e) => onUpdateConfig({ operator: e.target.value })} style={inputStyle}>
          <option value="equals">equals</option>
          <option value="contains">contains</option>
          <option value="present">is present</option>
          <option value="absent">is absent</option>
        </select>
      </Field>
      {(operator === "equals" || operator === "contains") && (
        <Field label="Comparison value">
          <input
            type="text"
            value={(node.config.value as string) ?? ""}
            onChange={(e) => onUpdateConfig({ value: e.target.value })}
            style={inputStyle}
          />
        </Field>
      )}
      <Field label="If TRUE → go to">
        <NodeKeySelect value={(node.config.true_next as string) ?? ""} allNodes={allNodes} selfKey={node.node_key} onChange={(v) => onUpdateConfig({ true_next: v })} />
      </Field>
      <Field label="If FALSE → go to">
        <NodeKeySelect value={(node.config.false_next as string) ?? ""} allNodes={allNodes} selfKey={node.node_key} onChange={(v) => onUpdateConfig({ false_next: v })} />
      </Field>
    </>
  );
}

function SetTagForm({ node, allNodes, onUpdateConfig }: Props) {
  return (
    <>
      <Field label="Mode">
        <select value={(node.config.mode as string) ?? "add"} onChange={(e) => onUpdateConfig({ mode: e.target.value })} style={inputStyle}>
          <option value="add">Add tag</option>
          <option value="remove">Remove tag</option>
        </select>
      </Field>
      <Field label="Tag ID">
        <input
          type="text"
          value={(node.config.tag_id as string) ?? ""}
          onChange={(e) => onUpdateConfig({ tag_id: e.target.value })}
          placeholder="Enter tag identifier"
          style={inputStyle}
        />
      </Field>
      <Field label="Next node">
        <NodeKeySelect value={(node.config.next_node_key as string) ?? ""} allNodes={allNodes} selfKey={node.node_key} onChange={(v) => onUpdateConfig({ next_node_key: v })} />
      </Field>
    </>
  );
}

function HandoffForm({ node, onUpdateConfig }: Props) {
  return (
    <Field label="Internal note (optional)">
      <textarea
        value={(node.config.note as string) ?? ""}
        rows={3}
        onChange={(e) => onUpdateConfig({ note: e.target.value })}
        placeholder="e.g. name={{vars.name}}, email={{vars.email}}"
        style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
      />
    </Field>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function NodeConfigForm({ node, allNodes, onUpdateConfig }: Props) {
  switch (node.node_type) {
    case "start":         return <StartForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "send_message":  return <SendMessageForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "send_buttons":  return <SendButtonsForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "send_list":     return <SendListForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "send_media":    return <SendMediaForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "collect_input": return <CollectInputForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "condition":     return <ConditionForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "set_tag":       return <SetTagForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "handoff":       return <HandoffForm node={node} allNodes={allNodes} onUpdateConfig={onUpdateConfig} />;
    case "end":
      return <p style={{ fontSize: 13, color: "#64748b" }}>End nodes have no configuration. The flow run terminates when this node is reached.</p>;
  }
}
