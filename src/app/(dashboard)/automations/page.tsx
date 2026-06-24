"use client";

import React, { useEffect, useState } from "react";
import { Zap, Plus, Pencil, Trash2, Loader2, MessageCircle, Clock, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { COLORS } from "@/core/components/theme/colors";
import {
  TemplateMessage,
  getTemplateMessages,
  createTemplateMessage,
  updateTemplateMessage,
  deleteTemplateMessage,
} from "@/core/api/templateApi";

interface PresetTemplate {
  name: string;
  description: string;
  trigger: string;
  reply: string;
  icon: React.ReactNode;
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<TemplateMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Active status mock storage
  const [activeStatusMap, setActiveStatusMap] = useState<Record<string, boolean>>({});

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TemplateMessage | null>(null);
  
  // Form fields
  const [trigger, setTrigger] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete control
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRules = async () => {
    try {
      const data = await getTemplateMessages();
      setRules(data);

      // Load toggles state from localStorage to persist mock toggles
      const stored = localStorage.getItem("anad_automation_rules_toggles");
      if (stored) {
        setActiveStatusMap(JSON.parse(stored));
      } else {
        // Default all to active
        const defaults: Record<string, boolean> = {};
        data.forEach((r) => {
          defaults[r.id] = true;
        });
        setActiveStatusMap(defaults);
      }
    } catch {
      toast.error("Failed to load automation rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const persistToggle = (id: string, val: boolean) => {
    const updated = { ...activeStatusMap, [id]: val };
    setActiveStatusMap(updated);
    localStorage.setItem("anad_automation_rules_toggles", JSON.stringify(updated));
    toast.success(val ? "Auto-reply rule enabled" : "Auto-reply rule disabled");
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setTrigger("");
    setReplyMessage("");
    setModalOpen(true);
  };

  const openEditModal = (rule: TemplateMessage) => {
    setEditingRule(rule);
    setTrigger(rule.title);
    setReplyMessage(rule.message);
    setModalOpen(true);
  };

  const handleUsePreset = (preset: PresetTemplate) => {
    setEditingRule(null);
    setTrigger(preset.trigger);
    setReplyMessage(preset.reply);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trigger.trim() || !replyMessage.trim()) {
      toast.error("Please fill in both trigger keyword and reply message");
      return;
    }

    setSaving(true);
    try {
      if (editingRule) {
        await updateTemplateMessage(editingRule.id, trigger.trim(), replyMessage.trim());
        toast.success("Automation rule updated!");
      } else {
        const created = await createTemplateMessage(trigger.trim(), replyMessage.trim());
        // set default active toggle
        persistToggle(created.id, true);
        toast.success("Automation rule created!");
      }
      setModalOpen(false);
      loadRules();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save rule";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTemplateMessage(id);
      toast.success("Automation rule deleted");
      loadRules();
    } catch {
      toast.error("Failed to delete automation rule");
    } finally {
      setDeletingId(null);
    }
  };

  // Predefined quickstart templates
  const presets: PresetTemplate[] = [
    {
      name: "Welcome greeting",
      description: "Send friendly intro when lead says hello",
      trigger: "hello, hi, hey, greetings",
      reply: "Hi there! 👋 Thanks for contacting ANAD. How can we help you today?",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      name: "Out of Office",
      description: "Auto-reply when messages arrive offline",
      trigger: "away, offline, closed",
      reply: "Hello! We are currently offline. Our working hours are Mon-Fri, 9am-6pm. We will get back to you as soon as we return!",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Price inquiry",
      description: "Quick quote or price list trigger",
      trigger: "price, cost, rates, package",
      reply: "Thanks for inquiring! 🌟 Here are our standard packages. Let us know which one fits your project requirements best.",
      icon: <Info className="h-5 w-5" />,
    },
    {
      name: "Office Location",
      description: "Address directions auto-reply",
      trigger: "location, address, map, directions",
      reply: "We are located at: Business Bay, Dubai, UAE. 📍 You can view directions on Google Maps here: https://maps.google.com/example",
      icon: <Sparkles className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
            Automations & Flows
          </h1>
          <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
            Define custom auto-reply rules triggered by incoming WhatsApp keywords.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 mt-3 sm:mt-0"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Plus className="h-4 w-4" />
          Create Rule
        </button>
      </div>

      {/* Quick Start Presets Section */}
      <section className="mt-2">
        <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: COLORS.muted }}>
          Quick-Start Recipes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleUsePreset(preset)}
              className="flex flex-col items-start text-left rounded-2xl border p-4 transition-all hover:bg-gray-50/50 hover:shadow-sm"
              style={{ borderColor: COLORS.border, backgroundColor: "white" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                style={{ backgroundColor: `${COLORS.primary}12`, color: COLORS.primary }}
              >
                {preset.icon}
              </div>
              <p className="text-sm font-bold" style={{ color: COLORS.text }}>
                {preset.name}
              </p>
              <p className="text-xs mt-1 leading-normal" style={{ color: COLORS.muted }}>
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Rules List */}
      <section className="mt-2">
        <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: COLORS.muted }}>
          My Auto-Reply Rules
        </h2>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
          </div>
        ) : rules.length === 0 ? (
          <div
            className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center"
            style={{ borderColor: "#D1D5DB", backgroundColor: "white" }}
          >
            <Zap className="h-8 w-8 mb-3" style={{ color: COLORS.muted }} />
            <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
              No automation rules configured
            </p>
            <p className="text-xs mt-1 mb-4" style={{ color: COLORS.muted }}>
              Create your first rule above or select a preset recipe to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {rules.map((rule) => {
              const isActive = activeStatusMap[rule.id] !== false;
              return (
                <div
                  key={rule.id}
                  className="flex flex-col gap-4 rounded-2xl border p-5 bg-white shadow-sm sm:flex-row sm:items-center sm:justify-between transition-all hover:shadow"
                  style={{ borderColor: COLORS.border }}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5"
                      style={{
                        backgroundColor: isActive ? `${COLORS.primary}12` : "#F1F5F9",
                        color: isActive ? COLORS.primary : "#94A3B8",
                      }}
                    >
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                          Trigger Keyword:
                        </span>
                        <span
                          className="rounded-lg px-2.5 py-0.5 font-mono text-xs font-semibold"
                          style={{
                            backgroundColor: isActive ? `${COLORS.primary}18` : "#E2E8F0",
                            color: isActive ? COLORS.primaryDark : "#475569",
                          }}
                        >
                          {rule.title}
                        </span>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap leading-relaxed" style={{ color: COLORS.text }}>
                        {rule.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 border-t pt-3 sm:border-t-0 sm:pt-0" style={{ borderColor: "#F1F5F9" }}>
                    {/* Active toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold" style={{ color: COLORS.muted }}>
                        {isActive ? "Enabled" : "Disabled"}
                      </span>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => persistToggle(rule.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>

                    {/* Edit/Delete actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(rule)}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                        title="Edit rule"
                        style={{ color: COLORS.text }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        disabled={deletingId === rule.id}
                        className="rounded-lg p-2 transition-colors hover:bg-red-50 text-red-500 disabled:opacity-50"
                        title="Delete rule"
                      >
                        {deletingId === rule.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(13,27,62,0.45)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-5" style={{ borderColor: "#E5E7EB" }}>
              <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                {editingRule ? "Edit Auto-Reply Rule" : "Create Auto-Reply Rule"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                style={{ color: COLORS.muted }}
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                  Trigger Keyword(s)
                </label>
                <input
                  type="text"
                  placeholder="e.g. price, package (comma separated)"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none"
                  style={{ borderColor: "#D1D5DB" }}
                />
                <span className="text-[10px]" style={{ color: COLORS.muted }}>
                  Rule fires when incoming message matches or contains these keywords.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                  Auto-Reply Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your automated response..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none resize-none"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-4 mt-2" style={{ borderColor: "#E5E7EB" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
                  style={{ color: COLORS.text, borderColor: "#D1D5DB" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingRule ? "Save Changes" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
