"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Play, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import {
  getTemplates,
  createBroadcast,
  sendBroadcast,
  MetaTemplate,
} from "@/core/api/broadcastApi";
import { toast } from "sonner";

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

export default function NewBroadcastPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<MetaTemplate | null>(null);
  const [audienceType, setAudienceType] = useState("all");
  const [bodyVariables, setBodyVariables] = useState<Record<string, string>>({});
  const [sendImmediately, setSendImmediately] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTpl = async () => {
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
  }, []);

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

  const handleVariableChange = (key: string, val: string) => {
    setBodyVariables((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

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

      const res = await createBroadcast({
        campaignName: campaignName.trim(),
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language,
        templateParams,
        filterByStatus: audienceType,
      });

      toast.success("Broadcast campaign created successfully!");

      if (sendImmediately && res?.broadcastId) {
        await sendBroadcast(res.broadcastId);
        toast.success("Broadcast sending started!");
      }

      router.push("/broadcasts");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create broadcast";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/broadcasts")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-gray-50"
          style={{ borderColor: "#D1D5DB" }}
        >
          <ArrowLeft className="h-5 w-5" style={{ color: COLORS.text }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
            New Broadcast Campaign
          </h1>
          <p className="text-xs" style={{ color: COLORS.muted }}>
            Step {step} of 3
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
        {step === 1 && (
          <div className="flex flex-col gap-5">
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                Select Message Template
              </label>
              {loadingTemplates ? (
                <div className="flex items-center gap-2 text-xs py-3" style={{ color: COLORS.muted }}>
                  <Loader2 className="h-4 w-4 animate-spin animate-spin" style={{ color: COLORS.primary }} />
                  Loading approved templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-center text-xs" style={{ color: COLORS.muted }}>
                  No approved templates found in Meta.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {templates.map((tpl) => (
                    <button
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
                Select Target Audience
              </label>
              <p className="text-xs -mt-1" style={{ color: COLORS.muted }}>
                Choose which leads should receive this broadcast.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                {LEAD_STATUSES.map((status) => (
                  <button
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

        {step === 3 && selectedTemplate && (
          <div className="flex flex-col gap-5">
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
                          className="inline-flex h-8 w-12 items-center justify-center rounded-lg text-xs font-mono font-bold"
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

            <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={sendImmediately}
                onChange={(e) => setSendImmediately(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between border-t mt-6 pt-5" style={{ borderColor: "#E5E7EB" }}>
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
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
              onClick={() => {
                if (step === 1 && !campaignName.trim()) {
                  toast.error("Please enter a campaign name");
                  return;
                }
                if (step === 1 && !selectedTemplate) {
                  toast.error("Please select a template");
                  return;
                }
                setStep((s) => s + 1);
              }}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: COLORS.primary }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: COLORS.success }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : sendImmediately ? (
                <>
                  <Play className="h-4 w-4" />
                  Send Broadcast
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Draft
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
