"use client";

import React, { useEffect, useState, useMemo } from "react";
import { X, Loader2, Play, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import {
  getTemplates,
  createBroadcast,
  sendBroadcast,
  MetaTemplate,
} from "@/core/api/broadcastApi";
import { toast } from "sonner";

interface NewBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const LEAD_STATUSES = [
  { value: "all", label: "All Leads" },
  { value: "New Lead", label: "New Lead" },
  { value: "Hot Lead", label: "Hot Lead" },
  { value: "Follow Up", label: "Follow Up" },
  { value: "Contacted", label: "Contacted" },
  { value: "Closed", label: "Closed Lead" },
  { value: "Not Interested", label: "Not Interested" },
  { value: "RNR", label: "RNR (Ring No Response)" },
  { value: "Busy", label: "Busy" },
  { value: "Switch Off", label: "Switch Off" },
  { value: "Enrolled", label: "Enrolled" },
  { value: "Register", label: "Registered" },
  { value: "Disqualified", label: "Disqualified" },
  { value: "Customer", label: "Customer" },
];

export default function NewBroadcastModal({ open, onClose, onCreated }: NewBroadcastModalProps) {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<MetaTemplate | null>(null);
  const [audienceType, setAudienceType] = useState("all");
  const [bodyVariables, setBodyVariables] = useState<Record<string, string>>({});
  const [sendImmediately, setSendImmediately] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load templates on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setCampaignName("");
      setSelectedTemplate(null);
      setAudienceType("all");
      setBodyVariables({});
      setSendImmediately(true);
      
      const fetchTpl = async () => {
        setLoadingTemplates(true);
        try {
          const tpls = await getTemplates();
          setTemplates(tpls);
        } catch {
          toast.error("Failed to fetch WhatsApp templates");
        } finally {
          setLoadingTemplates(false);
        }
      };
      fetchTpl();
    }
  }, [open]);

  // Extract body component and placeholders (e.g. {{1}}, {{2}})
  const bodyText = useMemo(() => {
    if (!selectedTemplate) return "";
    const bodyComp = selectedTemplate.components.find((c) => c.type === "BODY");
    return bodyComp?.text || "";
  }, [selectedTemplate]);

  const placeholders = useMemo(() => {
    const matches = bodyText.match(/\{\{(\d+)\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches)).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""));
      const numB = parseInt(b.replace(/\D/g, ""));
      return numA - numB;
    });
  }, [bodyText]);

  // Handle variable change
  const handleVariableChange = (key: string, val: string) => {
    setBodyVariables((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Next button handler — validates step 1 before advancing
  const handleNext = () => {
    if (step === 1) {
      if (loadingTemplates) {
        toast.error("Please wait for templates to finish loading");
        return;
      }
      if (!campaignName.trim()) {
        toast.error("Please enter a campaign name");
        return;
      }
      if (!selectedTemplate) {
        toast.error("Please select a message template");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  // Derived: is the Next button logically blocked on step 1?
  const nextDisabled =
    step === 1 &&
    (loadingTemplates || !campaignName.trim() || !selectedTemplate);

  // Preview body with current variables
  const previewText = useMemo(() => {
    let text = bodyText;
    placeholders.forEach((placeholder) => {
      const num = placeholder.replace(/\D/g, "");
      const value = bodyVariables[num] || placeholder;
      text = text.replaceAll(placeholder, value);
    });
    return text;
  }, [bodyText, placeholders, bodyVariables]);

  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    // Check if all placeholders are mapped
    const missing = placeholders.some((ph) => {
      const num = ph.replace(/\D/g, "");
      return !bodyVariables[num]?.trim();
    });

    if (missing) {
      toast.error("Please fill out all template variables");
      return;
    }

    setSubmitting(true);
    try {
      // Build parameters payload
      // WhatsApp API requires the format:
      // components: [{ type: "body", parameters: [{ type: "text", text: "val1" }, ...] }]
      const templateParams = placeholders.length > 0
        ? [
            {
              type: "body",
              parameters: placeholders.map((ph) => {
                const num = ph.replace(/\D/g, "");
                return {
                  type: "text",
                  text: bodyVariables[num] || "",
                };
              }),
            },
          ]
        : [];

      // Create broadcast
      const res = await createBroadcast({
        campaignName: campaignName.trim(),
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language,
        templateParams,
        filterByStatus: audienceType,
      });

      toast.success("Broadcast campaign created successfully!");

      // Send if selected
      if (sendImmediately && res?.broadcastId) {
        await sendBroadcast(res.broadcastId);
        toast.success("Broadcast sending started!");
      }

      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create broadcast";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(13,27,62,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="flex h-[90vh] max-h-[620px] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ borderColor: COLORS.border }}
      >
        {/* Modal Header */}
        <div className="border-b px-6 pt-4 pb-3" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: COLORS.text }}>
              Create WhatsApp Broadcast
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
              style={{ color: COLORS.muted }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Step Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors"
                    style={{
                      backgroundColor: s <= step ? COLORS.primary : "#E5E7EB",
                      color: s <= step ? "white" : COLORS.muted,
                    }}
                  >
                    {s < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                  </div>
                  <span
                    className="text-[11px] font-semibold hidden sm:block"
                    style={{ color: s === step ? COLORS.primary : COLORS.muted }}
                  >
                    {s === 1 ? "Template" : s === 2 ? "Audience" : "Personalize"}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className="h-0.5 flex-1 rounded-full transition-colors"
                    style={{ backgroundColor: s < step ? COLORS.primary : "#E5E7EB" }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Modal Body / Steps */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {/* Campaign Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                  Campaign Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Promo 2026"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              {/* Choose Template */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                  Select Message Template
                </label>
                {loadingTemplates ? (
                  <div className="flex items-center gap-2 text-xs py-3" style={{ color: COLORS.muted }}>
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: COLORS.primary }} />
                    Loading approved templates...
                  </div>
                ) : templates.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-center text-xs" style={{ color: COLORS.muted }}>
                    No approved templates found in Meta.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1">
                    {templates.map((tpl) => (
                      <button
                        type="button"
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl)}
                        className="flex flex-col text-left rounded-xl border p-3.5 transition-all"
                        style={{
                          borderColor: selectedTemplate?.id === tpl.id ? COLORS.primary : "#E5E7EB",
                          backgroundColor: selectedTemplate?.id === tpl.id ? `${COLORS.primary}06` : "white",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
                            {tpl.name}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: "#DEF7EC",
                              color: "#03543F",
                            }}
                          >
                            {tpl.language}
                          </span>
                        </div>
                        <p className="mt-1 text-xs line-clamp-2" style={{ color: COLORS.muted }}>
                          {tpl.components.find((c) => c.type === "BODY")?.text || "No preview text"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              {/* Select Audience */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                  Select Target Audience
                </label>
                <p className="text-xs -mt-1" style={{ color: COLORS.muted }}>
                  Choose which leads should receive this broadcast.
                </p>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {LEAD_STATUSES.map((status) => (
                    <button
                      type="button"
                      key={status.value}
                      onClick={() => setAudienceType(status.value)}
                      className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all"
                      style={{
                        borderColor: audienceType === status.value ? COLORS.primary : "#E5E7EB",
                        backgroundColor: audienceType === status.value ? `${COLORS.primary}06` : "white",
                        color: audienceType === status.value ? COLORS.primary : COLORS.text,
                      }}
                    >
                      <span>{status.label}</span>
                      <div
                        className="flex h-4 w-4 items-center justify-center rounded-full border"
                        style={{
                          borderColor: audienceType === status.value ? COLORS.primary : "#CBD5E1",
                        }}
                      >
                        {audienceType === status.value && (
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              {!selectedTemplate ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <p className="text-sm font-semibold" style={{ color: COLORS.text }}>No template selected</p>
                  <p className="text-xs" style={{ color: COLORS.muted }}>Please go back and select a template first.</p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold"
                    style={{ color: COLORS.text }}
                  >
                    ← Go Back to Step 1
                  </button>
                </div>
              ) : (
                <>
                  {/* Variables personalization */}
                  {placeholders.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                        Personalize Template Variables
                      </label>
                      <div className="flex flex-col gap-3 rounded-2xl border p-4 bg-gray-50/50">
                        {placeholders.map((ph) => {
                          const num = ph.replace(/\D/g, "");
                          return (
                            <div key={ph} className="flex items-center gap-4">
                              <span
                                className="inline-flex h-8 w-12 items-center justify-center rounded-lg text-xs font-mono font-bold flex-shrink-0"
                                style={{ backgroundColor: `${COLORS.primary}12`, color: COLORS.primary }}
                              >
                                {ph}
                              </span>
                              <input
                                type="text"
                                placeholder={`Value for ${ph}...`}
                                value={bodyVariables[num] || ""}
                                onChange={(e) => handleVariableChange(num, e.target.value)}
                                className="flex-1 rounded-xl border px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                style={{ borderColor: "#D1D5DB", backgroundColor: "white" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Message Live Preview */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                      Message Preview
                    </label>
                    <div className="rounded-2xl p-4 bg-[#F0F2F5] border" style={{ borderColor: "#E5E7EB" }}>
                      <div className="max-w-[85%] rounded-2xl bg-white p-3.5 shadow-sm">
                        <p className="whitespace-pre-wrap text-sm" style={{ color: COLORS.text }}>
                          {previewText}
                        </p>
                        <span className="mt-1 block text-right text-[10px]" style={{ color: COLORS.muted }}>
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Send immediately option */}
                  <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={sendImmediately}
                      onChange={(e) => setSendImmediately(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                        Send Broadcast Campaign Immediately
                      </p>
                      <p className="text-xs" style={{ color: COLORS.muted }}>
                        If unchecked, the broadcast will be saved as a draft.
                      </p>
                    </div>
                  </label>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-gray-50" style={{ borderColor: "#E5E7EB" }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
              style={{ color: COLORS.text }}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={nextDisabled}
              title={
                step === 1
                  ? loadingTemplates
                    ? "Please wait for templates to load"
                    : !campaignName.trim()
                    ? "Please enter a campaign name"
                    : !selectedTemplate
                    ? "Please select a message template"
                    : undefined
                  : undefined
              }
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loadingTemplates && step === 1 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !selectedTemplate}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: COLORS.success }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Broadcast...
                </>
              ) : sendImmediately ? (
                <>
                  <Play className="h-4 w-4" />
                  Send Broadcast
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save as Draft
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
