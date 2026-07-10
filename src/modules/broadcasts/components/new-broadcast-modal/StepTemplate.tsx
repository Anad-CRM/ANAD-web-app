"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import type { MetaTemplate } from "@/modules/broadcasts/types/broadcast.types";
import type { TemplateMessage } from "@/modules/broadcasts/types/broadcast.types";
import type { TemplateSource } from "@/modules/broadcasts/types/broadcast.types";
import { TEMPLATE_STATUS_CONFIG, TEMPLATE_CATEGORY_CONFIG } from "../../constants/broadcastConstants";

type TemplateTab = "meta" | "custom";

interface StepTemplateProps {
  campaignName: string;
  onCampaignNameChange: (val: string) => void;
  metaTemplates: MetaTemplate[];
  customTemplates: TemplateMessage[];
  selectedTemplate: TemplateSource | null;
  onSelectTemplate: (tpl: TemplateSource) => void;
  loadingTemplates: boolean;
  onAddCustomTemplate: (title: string, message: string) => Promise<void>;
  onDeleteCustomTemplate: (id: string) => Promise<void>;
  addingCustomTemplate: boolean;
}

/**
 * Step 1 — Campaign name + template selection.
 * Supports both Meta-approved templates and local custom templates via tabbed UI.
 */
export function StepTemplate({
  campaignName,
  onCampaignNameChange,
  metaTemplates,
  customTemplates,
  selectedTemplate,
  onSelectTemplate,
  loadingTemplates,
  onAddCustomTemplate,
  onDeleteCustomTemplate,
  addingCustomTemplate,
}: StepTemplateProps) {
  const [activeTab, setActiveTab] = useState<TemplateTab>("meta");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const handleAddSubmit = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    await onAddCustomTemplate(newTitle.trim(), newBody.trim());
    setNewTitle("");
    setNewBody("");
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Campaign Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
          Campaign Name <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Summer Promo 2026"
          value={campaignName}
          onChange={(e) => onCampaignNameChange(e.target.value)}
          className="rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none"
          style={{ borderColor: "#D1D5DB" }}
        />
      </div>

      {/* Template Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
          Select Message Template <span style={{ color: "#EF4444" }}>*</span>
        </label>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border bg-gray-50 p-1" style={{ borderColor: "#E5E7EB" }}>
          <button
            type="button"
            onClick={() => setActiveTab("meta")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
            style={{
              backgroundColor: activeTab === "meta" ? "white" : "transparent",
              color: activeTab === "meta" ? COLORS.primary : COLORS.muted,
              boxShadow: activeTab === "meta" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Meta Approved
            {metaTemplates.length > 0 && (
              <span
                className="rounded-full px-1.5 py-0 text-[9px] font-bold"
                style={{
                  backgroundColor: activeTab === "meta" ? `${COLORS.primary}15` : "#E5E7EB",
                  color: activeTab === "meta" ? COLORS.primary : COLORS.muted,
                }}
              >
                {metaTemplates.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
            style={{
              backgroundColor: activeTab === "custom" ? "white" : "transparent",
              color: activeTab === "custom" ? "#7C3AED" : COLORS.muted,
              boxShadow: activeTab === "custom" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Custom Templates
            {customTemplates.length > 0 && (
              <span
                className="rounded-full px-1.5 py-0 text-[9px] font-bold"
                style={{
                  backgroundColor: activeTab === "custom" ? "#F3F4F6" : "#E5E7EB",
                  color: activeTab === "custom" ? "#7C3AED" : COLORS.muted,
                }}
              >
                {customTemplates.length}
              </span>
            )}
          </button>
        </div>

        {/* Loading state */}
        {loadingTemplates ? (
          <div className="flex items-center gap-2 py-4 text-xs" style={{ color: COLORS.muted }}>
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: COLORS.primary }} />
            Loading templates…
          </div>
        ) : activeTab === "meta" ? (
          /* ── Meta Templates ──────────────────────────────── */
          <div className="flex flex-col gap-2">
            {metaTemplates.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 px-4 text-center">
                <AlertCircle className="h-8 w-8 text-gray-300" />
                <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                  No approved Meta templates
                </p>
                <p className="text-xs max-w-xs" style={{ color: COLORS.muted }}>
                  You need a connected WhatsApp Business account with approved templates. 
                  Meanwhile, try <button type="button" onClick={() => setActiveTab("custom")} className="underline font-medium" style={{ color: "#7C3AED" }}>Custom Templates</button>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-0.5">
                {metaTemplates.map((tpl) => {
                  const isSelected =
                    selectedTemplate?.source === "meta" && selectedTemplate.id === tpl.id;

                  const categoryKey = (tpl.category || "").toUpperCase();
                  const categoryCfg = TEMPLATE_CATEGORY_CONFIG[categoryKey] || {
                    label: tpl.category || "Utility",
                    bg: "#EFF6FF",
                    text: "#1E40AF",
                    border: "#BFDBFE",
                  };

                  const statusKey = (tpl.status || "APPROVED").toUpperCase();
                  const statusCfg = TEMPLATE_STATUS_CONFIG[statusKey] || {
                    label: tpl.status || "Approved",
                    bg: "#DEF7EC",
                    text: "#03543F",
                    border: "#DEF7EC",
                  };

                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() =>
                        onSelectTemplate({
                          source: "meta",
                          id: tpl.id,
                          name: tpl.name,
                          status: tpl.status,
                          language: tpl.language,
                          category: tpl.category,
                          components: tpl.components,
                        })
                      }
                      className="flex flex-col text-left rounded-xl border p-3.5 transition-all gap-1.5"
                      style={{
                        borderColor: isSelected ? COLORS.primary : "#E5E7EB",
                        backgroundColor: isSelected ? `${COLORS.primary}06` : "white",
                        outline: isSelected ? `2px solid ${COLORS.primary}30` : "none",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className="text-sm font-semibold truncate max-w-[180px]"
                          style={{ color: COLORS.text }}
                        >
                          {tpl.name}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-semibold border"
                            style={{
                              backgroundColor: categoryCfg.bg,
                              color: categoryCfg.text,
                              borderColor: categoryCfg.border,
                            }}
                          >
                            {categoryCfg.label}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-semibold border"
                            style={{
                              backgroundColor: statusCfg.bg,
                              color: statusCfg.text,
                              borderColor: statusCfg.border,
                            }}
                          >
                            {statusCfg.label}
                          </span>
                          <span className="rounded-full px-2 py-0.5 text-[9px] font-medium border bg-gray-50 text-gray-500 border-gray-200">
                            {tpl.language}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs line-clamp-2" style={{ color: COLORS.muted }}>
                        {tpl.components.find((c) => c.type === "BODY")?.text || "No preview text"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── Custom Templates ────────────────────────────── */
          <div className="flex flex-col gap-2">
            {/* Header row with Add button */}
            <div className="flex items-center justify-between">
              <p className="text-[11px]" style={{ color: COLORS.muted }}>
                Your saved message templates
              </p>
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
                style={{
                  backgroundColor: showAddForm ? "#F3F4F6" : `${COLORS.primary}12`,
                  color: showAddForm ? COLORS.muted : COLORS.primary,
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                {showAddForm ? "Cancel" : "New Template"}
              </button>
            </div>

            {/* Inline create form */}
            {showAddForm && (
              <div
                className="flex flex-col gap-2.5 rounded-xl border p-4"
                style={{ borderColor: "#E5E7EB", backgroundColor: "#FAFAFA" }}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                    Template Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Welcome Message"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none bg-white"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                    Message Body{" "}
                    <span className="normal-case font-normal">(use {"{{1}}"}, {"{{2}}"} for variables)</span>
                  </label>
                  <textarea
                    placeholder="Hi {{1}}, thank you for reaching out! We'll get back to you shortly."
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    rows={3}
                    className="rounded-lg border px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none resize-none bg-white"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSubmit}
                  disabled={addingCustomTemplate || !newTitle.trim() || !newBody.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {addingCustomTemplate ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Save Template
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Custom template list */}
            {customTemplates.length === 0 && !showAddForm ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 px-4 text-center">
                <Sparkles className="h-8 w-8 text-gray-300" />
                <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                  No custom templates yet
                </p>
                <p className="text-xs" style={{ color: COLORS.muted }}>
                  Click <strong>New Template</strong> above to create your first reusable message.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-0.5">
                {customTemplates.map((tpl) => {
                  const isSelected =
                    selectedTemplate?.source === "custom" && selectedTemplate.id === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      className="group flex items-start gap-2 rounded-xl border p-3.5 transition-all"
                      style={{
                        borderColor: isSelected ? "#7C3AED" : "#E5E7EB",
                        backgroundColor: isSelected ? "#F5F3FF" : "white",
                        outline: isSelected ? "2px solid #7C3AED30" : "none",
                      }}
                    >
                      <button
                        type="button"
                        className="flex-1 flex flex-col text-left gap-0.5 min-w-0"
                        onClick={() =>
                          onSelectTemplate({
                            source: "custom",
                            id: tpl.id,
                            name: tpl.title,
                            body: tpl.message,
                          })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-semibold truncate"
                            style={{ color: isSelected ? "#7C3AED" : COLORS.text }}
                          >
                            {tpl.title}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-semibold border flex-shrink-0"
                            style={{ backgroundColor: "#FAF5FF", color: "#6B21A8", borderColor: "#E9D5FF" }}
                          >
                            Custom
                          </span>
                        </div>
                        <p className="text-xs line-clamp-2 mt-0.5" style={{ color: COLORS.muted }}>
                          {tpl.message}
                        </p>
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => onDeleteCustomTemplate(tpl.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-50"
                        title="Delete template"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note about custom templates and broadcasts */}
            {activeTab === "custom" && (
              <p className="text-[10px] rounded-lg px-3 py-2 bg-amber-50 border border-amber-100" style={{ color: "#92400E" }}>
                ⚠️ Custom templates are for reference/preview only. WhatsApp broadcasts require a <strong>Meta-approved</strong> template.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
