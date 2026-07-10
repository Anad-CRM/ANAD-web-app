/**
 * validate.ts — Client-side flow validation for the editor.
 * Ported from whatsapp_crm/src/lib/flows/validate.ts.
 * Removes the INTERACTIVE_LIMITS import; uses hardcoded Meta limits.
 */

const BUTTON_TITLE_MAX = 20;
const MAX_BUTTONS = 3;
const MAX_LIST_ROWS = 10;
const LIST_ROW_TITLE_MAX = 24;
const LIST_ROW_DESC_MAX = 72;
const BODY_MAX = 1024;

export interface ValidationIssue {
  severity: "error" | "warning";
  scope: "flow" | "trigger" | "node";
  node_key?: string;
  field?: string;
  message: string;
}

interface FlowInput {
  name: string;
  trigger_type: "keyword" | "first_inbound_message" | "manual";
  trigger_config: Record<string, unknown>;
  entry_node_id: string | null;
}

interface NodeInput {
  node_key: string;
  node_type: string;
  config: Record<string, unknown>;
}

export function validateFlowForActivation(
  flow: FlowInput,
  nodes: NodeInput[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!flow.name?.trim()) {
    issues.push({ severity: "error", scope: "flow", field: "name", message: "Flow name is required." });
  }

  issues.push(...validateTrigger(flow.trigger_type, flow.trigger_config));

  if (!flow.entry_node_id) {
    issues.push({ severity: "error", scope: "flow", field: "entry_node_id", message: "Pick an entry node before activating." });
  }

  const keys = new Set(nodes.map((n) => n.node_key));

  if (nodes.length === 0) {
    issues.push({ severity: "error", scope: "flow", message: "A flow needs at least one node before activation." });
  }

  if (flow.entry_node_id && !keys.has(flow.entry_node_id)) {
    issues.push({ severity: "error", scope: "flow", field: "entry_node_id", message: `Entry node "${flow.entry_node_id}" doesn't exist.` });
  }

  const seen = new Set<string>();
  for (const n of nodes) {
    if (seen.has(n.node_key)) {
      issues.push({ severity: "error", scope: "node", node_key: n.node_key, message: `Duplicate node_key "${n.node_key}".` });
    }
    seen.add(n.node_key);
  }

  for (const n of nodes) {
    issues.push(...validateNode(n, keys));
  }

  if (flow.entry_node_id && keys.has(flow.entry_node_id)) {
    const reached = reachableFromEntry(flow.entry_node_id, nodes);
    for (const n of nodes) {
      if (!reached.has(n.node_key)) {
        issues.push({ severity: "warning", scope: "node", node_key: n.node_key, message: `Node "${n.node_key}" is unreachable from the entry node.` });
      }
    }
  }

  return issues;
}

function validateTrigger(
  trigger_type: FlowInput["trigger_type"],
  trigger_config: Record<string, unknown>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (trigger_type === "keyword") {
    const keywords = Array.isArray(trigger_config.keywords)
      ? (trigger_config.keywords as unknown[])
      : null;
    if (!keywords || keywords.length === 0) {
      issues.push({ severity: "error", scope: "trigger", field: "trigger_config.keywords", message: "Keyword triggers need at least one keyword." });
    } else {
      const blanks = keywords.filter((k) => typeof k !== "string" || !k.trim()).length;
      if (blanks > 0) {
        issues.push({ severity: "warning", scope: "trigger", field: "trigger_config.keywords", message: `${blanks} keyword${blanks === 1 ? " is" : "s are"} blank — they won't match anything.` });
      }
    }
  }
  return issues;
}

function validateNode(node: NodeInput, knownKeys: Set<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  switch (node.node_type) {
    case "start": {
      const cfg = node.config as { next_node_key?: string };
      if (!cfg.next_node_key) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "next_node_key", message: "Start node must point to a next node." });
      } else if (!knownKeys.has(cfg.next_node_key)) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "next_node_key", message: `Start points to non-existent node "${cfg.next_node_key}".` });
      }
      break;
    }
    case "send_message": {
      const cfg = node.config as { text?: string; next_node_key?: string };
      if (!cfg.text?.trim()) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "text", message: "Send-message node needs a text body." });
      }
      if (!cfg.next_node_key) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "next_node_key", message: "Send-message node must point to a next node." });
      } else if (!knownKeys.has(cfg.next_node_key)) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "next_node_key", message: `Send-message points to non-existent node "${cfg.next_node_key}".` });
      }
      break;
    }
    case "send_buttons": {
      const cfg = node.config as { text?: string; buttons?: Array<{ reply_id?: string; title?: string; next_node_key?: string }> };
      if (!cfg.text?.trim()) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "text", message: "Send-buttons node needs a text body." });
      }
      const btns = cfg.buttons ?? [];
      if (btns.length < 1) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "buttons", message: "Send-buttons needs at least one button." });
      }
      if (btns.length > MAX_BUTTONS) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "buttons", message: `WhatsApp allows at most ${MAX_BUTTONS} buttons.` });
      }
      const seenIds = new Set<string>();
      btns.forEach((b, i) => {
        if (!b.reply_id?.trim()) {
          issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `buttons.${i}.reply_id`, message: `Button ${i + 1} needs a reply id.` });
        } else if (seenIds.has(b.reply_id)) {
          issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `buttons.${i}.reply_id`, message: `Duplicate button reply id "${b.reply_id}".` });
        }
        if (b.reply_id) seenIds.add(b.reply_id);
        if (!b.title?.trim()) {
          issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `buttons.${i}.title`, message: `Button ${i + 1} needs a title.` });
        } else if (b.title.length > BUTTON_TITLE_MAX) {
          issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `buttons.${i}.title`, message: `Button ${i + 1} title is over ${BUTTON_TITLE_MAX} chars.` });
        }
        if (!b.next_node_key) {
          issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `buttons.${i}.next_node_key`, message: `Button ${i + 1} needs a next node.` });
        } else if (!knownKeys.has(b.next_node_key)) {
          issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `buttons.${i}.next_node_key`, message: `Button ${i + 1} points to non-existent node "${b.next_node_key}".` });
        }
      });
      break;
    }
    case "send_list": {
      const cfg = node.config as { text?: string; button_label?: string; sections?: Array<{ title?: string; rows?: Array<{ reply_id?: string; title?: string; description?: string; next_node_key?: string }> }> };
      if (!cfg.text?.trim()) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "text", message: "Send-list node needs a text body." });
      }
      if (!cfg.button_label?.trim()) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "button_label", message: "Send-list needs a button label." });
      }
      const sections = cfg.sections ?? [];
      const totalRows = sections.reduce((sum, s) => sum + (s.rows?.length ?? 0), 0);
      if (totalRows < 1) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "sections", message: "Send-list needs at least one row." });
      }
      if (totalRows > MAX_LIST_ROWS) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "sections", message: `Send-list allows at most ${MAX_LIST_ROWS} rows total.` });
      }
      const seenIds = new Set<string>();
      sections.forEach((section, si) => {
        (section.rows ?? []).forEach((row, ri) => {
          const field = `sections.${si}.rows.${ri}`;
          if (!row.reply_id?.trim()) {
            issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `${field}.reply_id`, message: `Row ${ri + 1} needs a reply id.` });
          } else if (seenIds.has(row.reply_id)) {
            issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `${field}.reply_id`, message: `Duplicate list row id "${row.reply_id}".` });
          }
          if (row.reply_id) seenIds.add(row.reply_id);
          if (!row.title?.trim()) {
            issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `${field}.title`, message: `Row ${ri + 1} needs a title.` });
          } else if (row.title.length > LIST_ROW_TITLE_MAX) {
            issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `${field}.title`, message: `Row ${ri + 1} title exceeds ${LIST_ROW_TITLE_MAX} chars.` });
          }
          if (row.description && row.description.length > LIST_ROW_DESC_MAX) {
            issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `${field}.description`, message: `Row ${ri + 1} description exceeds ${LIST_ROW_DESC_MAX} chars.` });
          }
          if (!row.next_node_key) {
            issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `${field}.next_node_key`, message: `Row ${ri + 1} needs a next node.` });
          } else if (!knownKeys.has(row.next_node_key)) {
            issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: `${field}.next_node_key`, message: `Row ${ri + 1} points to non-existent node "${row.next_node_key}".` });
          }
        });
      });
      break;
    }
    case "collect_input": {
      const cfg = node.config as { prompt_text?: string; var_key?: string; next_node_key?: string };
      if (!cfg.prompt_text?.trim()) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "prompt_text", message: "Collect-input needs a prompt." });
      }
      if (!cfg.var_key?.trim()) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "var_key", message: "Collect-input needs a var_key." });
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(cfg.var_key)) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "var_key", message: `var_key "${cfg.var_key}" must be alphanumeric+underscore.` });
      }
      if (!cfg.next_node_key) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "next_node_key", message: "Collect-input must point to a next node." });
      } else if (!knownKeys.has(cfg.next_node_key)) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "next_node_key", message: `Collect-input points to non-existent node "${cfg.next_node_key}".` });
      }
      break;
    }
    case "condition": {
      const cfg = node.config as { subject?: string; subject_key?: string; operator?: string; value?: string; true_next?: string; false_next?: string };
      if (!cfg.subject) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "subject", message: "Condition needs a subject." });
      }
      if (!cfg.subject_key?.trim()) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "subject_key", message: "Condition needs a subject_key." });
      }
      if (!cfg.operator) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "operator", message: "Condition needs an operator." });
      }
      for (const branch of ["true_next", "false_next"] as const) {
        const key = cfg[branch];
        if (!key) {
          issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: branch, message: `Condition needs a node for the "${branch === "true_next" ? "true" : "false"}" branch.` });
        } else if (!knownKeys.has(key)) {
          issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: branch, message: `Condition "${branch}" points to non-existent node "${key}".` });
        }
      }
      break;
    }
    case "set_tag": {
      const cfg = node.config as { mode?: string; tag_id?: string; next_node_key?: string };
      if (!cfg.mode) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "mode", message: "Set-tag needs a mode (add or remove)." });
      }
      if (!cfg.tag_id) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "tag_id", message: "Set-tag needs a tag." });
      }
      if (!cfg.next_node_key) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "next_node_key", message: "Set-tag must point to a next node." });
      } else if (!knownKeys.has(cfg.next_node_key)) {
        issues.push({ severity: "error", scope: "node", node_key: node.node_key, field: "next_node_key", message: `Set-tag points to non-existent node "${cfg.next_node_key}".` });
      }
      break;
    }
    case "handoff":
    case "end":
      break;
    default:
      issues.push({ severity: "error", scope: "node", node_key: node.node_key, message: `Unknown node type "${node.node_type}".` });
  }

  return issues;
}

function reachableFromEntry(entryKey: string, nodes: NodeInput[]): Set<string> {
  const byKey = new Map<string, NodeInput>();
  for (const n of nodes) byKey.set(n.node_key, n);
  const visited = new Set<string>();
  const queue: string[] = [entryKey];
  while (queue.length > 0) {
    const key = queue.shift() as string;
    if (visited.has(key)) continue;
    visited.add(key);
    const node = byKey.get(key);
    if (!node) continue;
    for (const next of outgoingEdges(node)) {
      if (!visited.has(next)) queue.push(next);
    }
  }
  return visited;
}

function outgoingEdges(node: NodeInput): string[] {
  switch (node.node_type) {
    case "start":
    case "send_message":
    case "send_media":
    case "collect_input":
    case "set_tag": {
      const cfg = node.config as { next_node_key?: string };
      return cfg.next_node_key ? [cfg.next_node_key] : [];
    }
    case "condition": {
      const cfg = node.config as { true_next?: string; false_next?: string };
      const out: string[] = [];
      if (cfg.true_next) out.push(cfg.true_next);
      if (cfg.false_next) out.push(cfg.false_next);
      return out;
    }
    case "send_buttons": {
      const cfg = node.config as { buttons?: Array<{ next_node_key?: string }> };
      return (cfg.buttons ?? []).map((b) => b.next_node_key).filter((k): k is string => !!k);
    }
    case "send_list": {
      const cfg = node.config as { sections?: Array<{ rows?: Array<{ next_node_key?: string }> }> };
      const out: string[] = [];
      for (const s of cfg.sections ?? []) {
        for (const r of s.rows ?? []) {
          if (r.next_node_key) out.push(r.next_node_key);
        }
      }
      return out;
    }
    default:
      return [];
  }
}
