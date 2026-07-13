"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Workflow, Trash2 } from "lucide-react";
import {
  listFlows,
  createFlow,
  deleteFlow,
  getFlowTemplates,
  type Flow,
  type FlowTemplateSummary,
} from "@/core/api/flowApi";
import { COLORS } from "@/core/components/theme/colors";

export default function FlowsPage() {
  const router = useRouter();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [templates, setTemplates] = useState<FlowTemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [flowsData, templatesData] = await Promise.all([
          listFlows(),
          getFlowTemplates(),
        ]);
        setFlows(flowsData);
        setTemplates(templatesData);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load flows");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newFlowName.trim() && !selectedTemplate) {
      toast.error("Please enter a name or pick a template");
      return;
    }
    setCreating(true);
    try {
      let flow;
      if (selectedTemplate) {
        flow = await createFlow({
          name: newFlowName.trim(),
          template_slug: selectedTemplate,
        });
      } else {
        flow = await createFlow({
          name: newFlowName.trim(),
          trigger_type: "keyword",
        });
      }
      toast.success("Flow created!");
      router.push(`/flows/${flow.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create flow");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this flow? This cannot be undone.")) return;
    try {
      await deleteFlow(id);
      setFlows((prev) => prev.filter((f) => f.id !== id));
      toast.success("Flow deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete flow");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: COLORS.primaryDark }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Flows</h1>
          <p className="text-sm text-slate-500">
            Build interactive WhatsApp workflows to automate your customer communication.
          </p>
        </div>
        <button
          onClick={() => {
            setNewFlowName("");
            setSelectedTemplate(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-sm hover:opacity-90"
          style={{ backgroundColor: COLORS.primaryDark }}
        >
          <Plus className="h-4 w-4" /> Create Flow
        </button>
      </div>

      {/* Grid of Flows */}
      {flows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Workflow className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-base font-semibold text-slate-900">No flows created yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Get started by creating a blank flow or choose one of our pre-built templates.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            style={{ backgroundColor: COLORS.primaryDark }}
          >
            Create your first flow
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <div
              key={flow.id}
              onClick={() => router.push(`/flows/${flow.id}`)}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      flow.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {flow.status}
                  </span>
                  <button
                    onClick={(e) => handleDelete(flow.id, e)}
                    className="text-slate-400 hover:text-red-500 rounded-lg p-1 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {flow.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                  {flow.description || "No description provided."}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                <span>Triggers on: <strong className="text-slate-600">{flow.trigger_type}</strong></span>
                <span>Runs: <strong className="text-slate-600">{flow.execution_count}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          {/* Box */}
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 flex flex-col max-h-[85vh]">
            <h2 className="text-lg font-bold text-slate-900">Create new Flow</h2>

            <div className="mt-4 flex flex-col gap-4 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                  Flow Name
                </label>
                <input
                  type="text"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="e.g. Onboarding Flow"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                  Or select a template
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.slug}
                      onClick={() => setSelectedTemplate(tpl.slug)}
                      className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                        selectedTemplate === tpl.slug
                          ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900">{tpl.name}</h4>
                        <p className="mt-1 text-xs text-slate-500 leading-normal line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                      <span className="mt-4 text-[10px] font-semibold text-slate-400">
                        {tpl.node_count} nodes
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => setSelectedTemplate(null)}
                    className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                      selectedTemplate === null
                        ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">Blank Flow</h4>
                      <p className="mt-1 text-xs text-slate-500 leading-normal">
                        Start completely from scratch and design your custom routing.
                      </p>
                    </div>
                    <span className="mt-4 text-[10px] font-semibold text-slate-400">
                      Empty canvas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: COLORS.primaryDark }}
              >
                {creating ? "Creating..." : "Create Flow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
