"use client";

/**
 * shared.tsx — Per-node metadata, icon chip, colors, and summarize helper.
 * Ported from whatsapp_crm/src/components/flows/shared.tsx.
 * Adapted to use inline SVG instead of lucide-react icon objects for
 * compatibility, and stripped of next-intl i18n (hardcoded English).
 */

export type NodeType =
  | "start"
  | "send_message"
  | "send_buttons"
  | "send_list"
  | "send_media"
  | "collect_input"
  | "condition"
  | "set_tag"
  | "handoff"
  | "end";

export type NodeCategory = "messaging" | "logic" | "flow";

export interface BuilderNode {
  node_key: string;
  node_type: NodeType;
  config: Record<string, unknown>;
  position_x?: number;
  position_y?: number;
}

export interface NodeMeta {
  label: string;
  blurb: string;
  category: NodeCategory;
  iconPath: string; // SVG path d= for a 24x24 icon
}

export const NODE_META: Record<NodeType, NodeMeta> = {
  start: {
    label: "Start",
    blurb: "Entry point of the flow",
    category: "flow",
    iconPath:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z",
  },
  send_message: {
    label: "Send message",
    blurb: "Sends a WhatsApp text message",
    category: "messaging",
    iconPath:
      "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
  send_buttons: {
    label: "Send buttons",
    blurb: "Sends quick-reply buttons",
    category: "messaging",
    iconPath:
      "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  send_list: {
    label: "Send list",
    blurb: "Sends a tappable list of options",
    category: "messaging",
    iconPath: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  },
  send_media: {
    label: "Send media",
    blurb: "Sends an image, video, or document",
    category: "messaging",
    iconPath:
      "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  },
  collect_input: {
    label: "Collect input",
    blurb: "Asks a question, saves the reply",
    category: "logic",
    iconPath:
      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 0l8 8 8-8",
  },
  condition: {
    label: "If / else",
    blurb: "Branches on a rule",
    category: "logic",
    iconPath:
      "M6 3v12M6 9l6 6 6-6M18 9V3",
  },
  set_tag: {
    label: "Tag contact",
    blurb: "Adds or removes a contact tag",
    category: "logic",
    iconPath:
      "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  },
  handoff: {
    label: "Handoff to agent",
    blurb: "Hands the conversation to a human",
    category: "flow",
    iconPath:
      "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM20 8v6M23 11h-6",
  },
  end: {
    label: "End",
    blurb: "Ends the flow",
    category: "flow",
    iconPath: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  },
};

export const NODE_CATEGORIES: { id: NodeCategory; label: string }[] = [
  { id: "messaging", label: "Messaging" },
  { id: "logic", label: "Logic & data" },
  { id: "flow", label: "Flow control" },
];

export function groupNodeTypesByCategory(
  types: NodeType[]
): { id: NodeCategory; label: string; types: NodeType[] }[] {
  return NODE_CATEGORIES.map(({ id, label }) => ({
    id,
    label,
    types: types.filter((t) => NODE_META[t].category === id),
  })).filter((g) => g.types.length > 0);
}

// ─── Color system ──────────────────────────────────────────────────────────

const NODE_COLORS: Record<NodeType, { bg: string; text: string; border: string; ring: string }> = {
  start:         { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "#10b981", ring: "rgba(16,185,129,0.35)" },
  send_message:  { bg: "rgba(139,92,246,0.12)", text: "#8b5cf6", border: "#8b5cf6", ring: "rgba(139,92,246,0.35)" },
  send_buttons:  { bg: "rgba(99,102,241,0.12)",  text: "#6366f1", border: "#6366f1", ring: "rgba(99,102,241,0.35)" },
  send_list:     { bg: "rgba(79,70,229,0.12)",   text: "#4f46e5", border: "#4f46e5", ring: "rgba(79,70,229,0.35)" },
  send_media:    { bg: "rgba(14,165,233,0.12)",  text: "#0ea5e9", border: "#0ea5e9", ring: "rgba(14,165,233,0.35)" },
  collect_input: { bg: "rgba(20,184,166,0.12)",  text: "#14b8a6", border: "#14b8a6", ring: "rgba(20,184,166,0.35)" },
  condition:     { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b", border: "#f59e0b", ring: "rgba(245,158,11,0.35)" },
  set_tag:       { bg: "rgba(236,72,153,0.12)",  text: "#ec4899", border: "#ec4899", ring: "rgba(236,72,153,0.35)" },
  handoff:       { bg: "rgba(239,68,68,0.12)",   text: "#ef4444", border: "#ef4444", ring: "rgba(239,68,68,0.35)" },
  end:           { bg: "rgba(100,116,139,0.12)", text: "#64748b", border: "#64748b", ring: "rgba(100,116,139,0.35)" },
};

export function nodeColors(type: NodeType) {
  return NODE_COLORS[type] ?? NODE_COLORS.end;
}

// ─── Node icon chip component ───────────────────────────────────────────────

export function NodeIconChip({
  type,
  size = 28,
  iconSize = 14,
}: {
  type: NodeType;
  size?: number;
  iconSize?: number;
}) {
  const meta = NODE_META[type];
  const c = nodeColors(type);
  return (
    <span
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        minWidth: size,
        background: c.bg,
        color: c.text,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
      title={meta.label}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={meta.iconPath} />
      </svg>
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(s: string, fallback: string): string {
  const cleaned = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || fallback;
}

export function truncate(s: string, max = 80): string {
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1) + "…";
}

export function summarizeNode(node: BuilderNode): string | null {
  const cfg = node.config;
  switch (node.node_type) {
    case "start":
    case "end":
      return null;
    case "send_message": {
      const text = typeof cfg.text === "string" ? cfg.text : "";
      return text.length > 0 ? truncate(text) : null;
    }
    case "send_buttons": {
      const text = typeof cfg.text === "string" ? cfg.text : "";
      const buttons = Array.isArray(cfg.buttons)
        ? (cfg.buttons as Array<Record<string, unknown>>)
        : [];
      const titles = buttons
        .map((b) => (typeof b.title === "string" ? b.title : ""))
        .filter(Boolean)
        .join(" / ");
      if (text.length > 0) {
        return titles
          ? `${truncate(text, 40)} · ${truncate(titles, 35)}`
          : truncate(text);
      }
      return titles || null;
    }
    case "send_list": {
      const text = typeof cfg.text === "string" ? cfg.text : "";
      const sections = Array.isArray(cfg.sections)
        ? (cfg.sections as Array<Record<string, unknown>>)
        : [];
      const rowCount = sections.reduce<number>((sum, s) => {
        const rows = Array.isArray(s.rows) ? s.rows : [];
        return sum + rows.length;
      }, 0);
      if (text.length > 0) {
        return rowCount > 0
          ? `${truncate(text, 50)} · ${rowCount} option${rowCount === 1 ? "" : "s"}`
          : truncate(text);
      }
      return rowCount > 0 ? `${rowCount} option${rowCount === 1 ? "" : "s"}` : null;
    }
    case "send_media": {
      const mediaType = typeof cfg.media_type === "string" ? cfg.media_type : "";
      const url = typeof cfg.media_url === "string" ? cfg.media_url : "";
      const caption = typeof cfg.caption === "string" ? cfg.caption : "";
      const label = mediaType
        ? mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
        : "Media";
      if (!url) return `${label} (no file uploaded)`;
      const name =
        (typeof cfg.filename === "string" && cfg.filename) ||
        url.split("/").pop() ||
        "file";
      return caption
        ? `${label}: ${truncate(name, 30)} · ${truncate(caption, 40)}`
        : `${label}: ${truncate(name, 60)}`;
    }
    case "collect_input": {
      const prompt = typeof cfg.prompt_text === "string" ? cfg.prompt_text : "";
      const varKey = typeof cfg.var_key === "string" ? cfg.var_key : "";
      if (prompt.length > 0) {
        return varKey ? `${truncate(prompt, 50)} → vars.${varKey}` : truncate(prompt);
      }
      return varKey ? `→ vars.${varKey}` : null;
    }
    case "condition": {
      const subjectKey =
        typeof cfg.subject_key === "string" ? cfg.subject_key : "";
      if (!subjectKey) return null;
      const subject =
        cfg.subject === "tag"
          ? "tag"
          : cfg.subject === "contact_field"
          ? "field"
          : "var";
      const subjectStr =
        subject === "tag"
          ? `has tag ${truncate(subjectKey, 24)}`
          : `${subject}.${subjectKey}`;
      const op =
        cfg.operator === "equals"
          ? "=="
          : cfg.operator === "contains"
          ? "contains"
          : cfg.operator === "present"
          ? "exists"
          : cfg.operator === "absent"
          ? "missing"
          : "";
      const value = typeof cfg.value === "string" ? cfg.value : "";
      const valStr =
        (cfg.operator === "equals" || cfg.operator === "contains") && value
          ? ` "${truncate(value, 20)}"`
          : "";
      return subject === "tag" ? subjectStr : `${subjectStr} ${op}${valStr}`;
    }
    case "set_tag": {
      const mode =
        cfg.mode === "remove" ? "Remove" : "Add";
      const tagId = typeof cfg.tag_id === "string" ? cfg.tag_id : "";
      return tagId
        ? `${mode} tag ${tagId.slice(0, 8)}…`
        : `${mode} tag (none picked)`;
    }
    case "handoff": {
      const note = typeof cfg.note === "string" ? cfg.note : "";
      return note.length > 0 ? truncate(note) : null;
    }
  }
}
