"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Play,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { toast } from "sonner";
import { useNewBroadcast } from "@/modules/broadcasts/hooks/useNewBroadcast";
import { StepTemplate } from "@/modules/broadcasts/components/new-broadcast-modal/StepTemplate";
import { StepAudience } from "@/modules/broadcasts/components/new-broadcast-modal/StepAudience";
import { StepPersonalize } from "@/modules/broadcasts/components/new-broadcast-modal/StepPersonalize";
import type { MetaTemplate } from "@/core/api/broadcastApi";

export default function NewBroadcastPage() {
  const router = useRouter();

  const {
    step,
    setStep,
    handleNext,
    handleBack,
    metaTemplates,
    customTemplates,
    loadingTemplates,
    selectedTemplate,
    setSelectedTemplate,
    addCustomTemplate,
    deleteCustomTemplate,
    addingCustomTemplate,
    campaignName,
    setCampaignName,
    audienceType,
    setAudienceType,
    bodyVariables,
    handleVariableChange,
    sendImmediately,
    setSendImmediately,
    placeholders,
    previewText,
    submitting,
    handleSubmit: _hookSubmit,
  } = useNewBroadcast(
    true, // always "open" on this standalone page
    () => {
      router.push("/broadcasts");
    }
  );

  // Wrap handleSubmit to redirect after success
  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }
    if (selectedTemplate.source === "custom") {
      toast.error("Custom templates cannot be used for broadcast — please select a Meta-approved template.");
      return;
    }
    // _hookSubmit handles everything including the onCreated callback (router.push)
    await _hookSubmit();
  };

  // Convert TemplateSource → MetaTemplate-compatible shape for StepPersonalize
  const templateForPreview: MetaTemplate | null =
    selectedTemplate?.source === "meta"
      ? {
          id: selectedTemplate.id,
          name: selectedTemplate.name,
          status: selectedTemplate.status,
          language: selectedTemplate.language,
          category: selectedTemplate.category,
          components: selectedTemplate.components as MetaTemplate["components"],
        }
      : null;

  const canSubmit = selectedTemplate?.source === "meta" && !submitting;

  const STEP_LABELS = ["Template", "Audience", "Preview & Send"];

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
            Step {step} of 3 — {STEP_LABELS[step - 1]}
          </p>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, idx) => {
          const n = idx + 1;
          const isActive = step === n;
          const isDone = step > n;
          return (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all"
                  style={{
                    backgroundColor: isDone ? COLORS.success : isActive ? COLORS.primary : "#E5E7EB",
                    color: isDone || isActive ? "white" : COLORS.muted,
                  }}
                >
                  {isDone ? "✓" : n}
                </div>
                <span
                  className="text-xs font-semibold hidden sm:block"
                  style={{ color: isActive ? COLORS.text : COLORS.muted }}
                >
                  {label}
                </span>
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <div
                  className="flex-1 h-0.5 rounded-full"
                  style={{ backgroundColor: step > n ? COLORS.success : "#E5E7EB" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div
        className="rounded-3xl border bg-white p-6 shadow-sm"
        style={{ borderColor: COLORS.border }}
      >
        {step === 1 && (
          <StepTemplate
            campaignName={campaignName}
            onCampaignNameChange={setCampaignName}
            metaTemplates={metaTemplates}
            customTemplates={customTemplates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            loadingTemplates={loadingTemplates}
            onAddCustomTemplate={addCustomTemplate}
            onDeleteCustomTemplate={deleteCustomTemplate}
            addingCustomTemplate={addingCustomTemplate}
          />
        )}

        {step === 2 && (
          <StepAudience
            audienceType={audienceType}
            onAudienceTypeChange={setAudienceType}
          />
        )}

        {step === 3 && (
          <StepPersonalize
            selectedTemplate={templateForPreview}
            placeholders={placeholders}
            bodyVariables={bodyVariables}
            onVariableChange={handleVariableChange}
            previewText={previewText}
            sendImmediately={sendImmediately}
            onSendImmediatelyChange={setSendImmediately}
            onGoToStep1={() => setStep(1)}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t mt-6 pt-5" style={{ borderColor: "#E5E7EB" }}>
          {step > 1 ? (
            <button
              onClick={handleBack}
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

          <div className="flex items-center gap-3">
            {/* Warning when custom template at step 3 */}
            {step === 3 && selectedTemplate?.source === "custom" && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Switch to a Meta-approved template to send
              </div>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={loadingTemplates && step === 1}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: COLORS.primary }}
              >
                {loadingTemplates && step === 1 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
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
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: COLORS.success }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
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
    </div>
  );
}
