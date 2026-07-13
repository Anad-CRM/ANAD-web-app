import { api } from "./axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FlowStatus = "draft" | "active" | "archived";
export type FlowTriggerType = "keyword" | "first_inbound_message" | "manual";
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

export interface Flow {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  description: string | null;
  status: FlowStatus;
  trigger_type: FlowTriggerType;
  trigger_config: Record<string, unknown>;
  entry_node_id: string | null;
  fallback_policy: {
    on_unknown_reply: "reprompt" | "handoff" | "ignore";
    max_reprompts: number;
    on_timeout_hours: number;
    on_exhaust: "handoff" | "end";
  };
  execution_count: number;
  last_executed_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlowNode {
  id: string;
  flowId: string;
  node_key: string;
  node_type: NodeType;
  config: Record<string, unknown>;
  position_x: number;
  position_y: number;
  createdAt: string;
}

export interface FlowRun {
  id: string;
  flowId: string;
  organizationId: string;
  leadId: string | null;
  status: "active" | "completed" | "handed_off" | "timed_out" | "failed";
  current_node_key: string | null;
  vars: Record<string, unknown>;
  reprompt_count: number;
  started_at: string;
  last_advanced_at: string;
  ended_at: string | null;
  end_reason: string | null;
}

export interface FlowTemplateSummary {
  slug: string;
  name: string;
  description: string;
  icon: "MessageSquare" | "HelpCircle" | "UserPlus";
  node_count: number;
}

// ─── Builder node shape (used by the editor) ─────────────────────────────────

export interface BuilderNode {
  node_key: string;
  node_type: NodeType;
  config: Record<string, unknown>;
  position_x?: number;
  position_y?: number;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function listFlows(): Promise<Flow[]> {
  const res = await api.get<{ flows: Flow[] }>("/api/flows");
  return res.data.flows;
}

export async function getFlow(id: string): Promise<{ flow: Flow; nodes: FlowNode[] }> {
  const res = await api.get<{ flow: Flow; nodes: FlowNode[] }>(`/api/flows/${id}`);
  return res.data;
}

export async function createFlow(body: {
  name: string;
  description?: string;
  trigger_type?: FlowTriggerType;
  trigger_config?: Record<string, unknown>;
  template_slug?: string;
}): Promise<Flow> {
  const res = await api.post<{ flow: Flow }>("/api/flows", body);
  return res.data.flow;
}

export async function updateFlow(
  id: string,
  body: {
    name?: string;
    description?: string | null;
    trigger_type?: FlowTriggerType;
    trigger_config?: Record<string, unknown>;
    entry_node_id?: string | null;
    fallback_policy?: Flow["fallback_policy"];
    nodes?: BuilderNode[];
  }
): Promise<{ flow: Flow; nodes: FlowNode[] }> {
  const res = await api.put<{ flow: Flow; nodes: FlowNode[] }>(`/api/flows/${id}`, body);
  return res.data;
}

export async function deleteFlow(id: string): Promise<void> {
  await api.delete(`/api/flows/${id}`);
}

export async function setFlowStatus(id: string, status: FlowStatus): Promise<Flow> {
  const res = await api.post<{ flow: Flow }>(`/api/flows/${id}/activate`, { status });
  return res.data.flow;
}

export async function listFlowRuns(id: string): Promise<FlowRun[]> {
  const res = await api.get<{ runs: FlowRun[] }>(`/api/flows/${id}/runs`);
  return res.data.runs;
}

export async function getFlowTemplates(): Promise<FlowTemplateSummary[]> {
  const res = await api.get<{ templates: FlowTemplateSummary[] }>("/api/flows/templates");
  return res.data.templates;
}
