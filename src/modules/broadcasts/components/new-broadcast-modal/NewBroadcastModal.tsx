"use client";

import { X, Loader2, Play, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { useNewBroadcast } from "@/modules/broadcasts/hooks/useNewBroadcast";
import { StepProgress } from "./StepProgress";
import { StepTemplate } from "./StepTemplate";
import { StepAudience } from "./StepAudience";
import { StepPersonalize } from "./StepPersonalize";
import type { NewBroadcastModalProps, MetaTemplate } from "@/modules/broadcasts/types/broadcast.types";

/**
 * Multi-step modal for creating a WhatsApp broadcast campaign.
 *
 * Orchestrates three steps:
 *  1. Template selection + campaign name  →  <StepTemplate />
 *  2. Target audience filter              →  <StepAudience />
 *  3. Variable personalisation + preview  →  <StepPersonalize />
 *
 * All business logic lives in the `useNewBroadcast` hook.
 */
export function NewBroadcastModal({ open, onClose, onCreated }: NewBroadcastModalProps) {
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
    handleSubmit,
  } = useNewBroadcast(open, onCreated);

  if (!open) return null;

  const canSubmit = selectedTemplate?.source === "meta" && !submitting;

  // Convert TemplateSource to MetaTemplate-compatible shape for StepPersonalize
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(13,27,62,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="flex h-[90vh] max-h-[640px] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ borderColor: COLORS.border }}
      >
        {/* ── Header ──────────────────────────────────────── */}
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
          <StepProgress currentStep={step} />
        </div>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
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
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div
          className="flex items-center justify-between border-t px-6 py-4 bg-gray-50"
          style={{ borderColor: "#E5E7EB" }}
        >
          {/* Back button */}
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
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

          <div className="flex items-center gap-3">
            {/* Warning when custom template is selected at submit step */}
            {step === 3 && selectedTemplate?.source === "custom" && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Switch to a Meta template to send
              </div>
            )}

            {/* Next / Submit button */}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loadingTemplates && step === 1}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: COLORS.success }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Broadcast…
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
