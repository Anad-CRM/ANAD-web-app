"use client";

import { COLORS } from "@/core/components/theme/colors";
import type { MetaTemplate } from "@/modules/broadcasts/types/broadcast.types";
import { Image, Video, FileText, Sparkles } from "lucide-react";

interface StepPersonalizeProps {
  selectedTemplate: MetaTemplate | null;
  headerFormat?: string | null;
  headerPlaceholders?: string[];
  headerVariables?: Record<string, string>;
  onHeaderVariableChange?: (key: string, val: string) => void;
  headerMediaUrl?: string;
  onHeaderMediaUrlChange?: (url: string) => void;
  placeholders: string[];
  bodyVariables: Record<string, string>;
  onVariableChange: (key: string, val: string) => void;
  previewHeader?: string;
  previewText: string;
  sendImmediately: boolean;
  onSendImmediatelyChange: (val: boolean) => void;
  onGoToStep1: () => void;
}

/**
 * Step 3 — Variable personalization, media header attachment, live preview, and send mode toggle.
 */
export function StepPersonalize({
  selectedTemplate,
  headerFormat,
  headerPlaceholders = [],
  headerVariables = {},
  onHeaderVariableChange,
  headerMediaUrl = "",
  onHeaderMediaUrlChange,
  placeholders,
  bodyVariables,
  onVariableChange,
  previewHeader = "",
  previewText,
  sendImmediately,
  onSendImmediatelyChange,
  onGoToStep1,
}: StepPersonalizeProps) {
  if (!selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
          No template selected
        </p>
        <p className="text-xs" style={{ color: COLORS.muted }}>
          Please go back and select a Meta template first.
        </p>
        <button
          type="button"
          onClick={onGoToStep1}
          className="mt-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold"
          style={{ color: COLORS.text }}
        >
          ← Go Back to Step 1
        </button>
      </div>
    );
  }

  const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat || "");
  const footerComponent = selectedTemplate.components?.find((c) => c.type === "FOOTER");
  const buttonsComponent = selectedTemplate.components?.find((c) => c.type === "BUTTONS");

  return (
    <div className="flex flex-col gap-5">
      {/* Media Header URL input */}
      {isMediaHeader && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: COLORS.text }}>
            {headerFormat === "IMAGE" && <Image className="h-4 w-4 text-blue-500" />}
            {headerFormat === "VIDEO" && <Video className="h-4 w-4 text-purple-500" />}
            {headerFormat === "DOCUMENT" && <FileText className="h-4 w-4 text-amber-500" />}
            Header {headerFormat} URL <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            type="url"
            placeholder={`Enter public ${headerFormat} URL (e.g. https://example.com/banner.png)`}
            value={headerMediaUrl}
            onChange={(e) => onHeaderMediaUrlChange?.(e.target.value)}
            className="rounded-xl border px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-none"
            style={{ borderColor: "#D1D5DB" }}
          />
          <p className="text-[10px]" style={{ color: COLORS.muted }}>
            Meta requires a direct public URL for {headerFormat} header templates.
          </p>
        </div>
      )}

      {/* Header Variables input */}
      {headerPlaceholders.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
            Personalize Header Variables
          </label>
          <div className="flex flex-col gap-2.5 rounded-2xl border p-3.5 bg-gray-50/50">
            {headerPlaceholders.map((ph) => {
              const num = ph.replace(/\D/g, "");
              return (
                <div key={`h-${ph}`} className="flex items-center gap-3">
                  <span
                    className="inline-flex h-7 w-12 items-center justify-center rounded-lg text-xs font-mono font-bold flex-shrink-0"
                    style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}
                  >
                    Header {ph}
                  </span>
                  <input
                    type="text"
                    placeholder={`Value for Header ${ph}…`}
                    value={headerVariables[num] || ""}
                    onChange={(e) => onHeaderVariableChange?.(num, e.target.value)}
                    className="flex-1 rounded-xl border px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none bg-white"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Body Variables input */}
      {placeholders.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
            Personalize Body Variables
          </label>
          <div className="flex flex-col gap-2.5 rounded-2xl border p-3.5 bg-gray-50/50">
            {placeholders.map((ph) => {
              const num = ph.replace(/\D/g, "");
              return (
                <div key={`b-${ph}`} className="flex items-center gap-3">
                  <span
                    className="inline-flex h-7 w-12 items-center justify-center rounded-lg text-xs font-mono font-bold flex-shrink-0"
                    style={{ backgroundColor: `${COLORS.primary}12`, color: COLORS.primary }}
                  >
                    Body {ph}
                  </span>
                  <input
                    type="text"
                    placeholder={`Value for ${ph}…`}
                    value={bodyVariables[num] || ""}
                    onChange={(e) => onVariableChange(num, e.target.value)}
                    className="flex-1 rounded-xl border px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none bg-white"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: COLORS.text }}>
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          Live WhatsApp Message Preview
        </label>
        <div className="rounded-2xl p-4 bg-[#E5DDD5] border" style={{ borderColor: "#D1D5DB" }}>
          <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl bg-white p-3.5 shadow-sm border border-gray-200">
            {/* Header Media */}
            {isMediaHeader && headerMediaUrl && (
              <div className="mb-2.5 overflow-hidden rounded-xl bg-gray-100 border">
                {headerFormat === "IMAGE" && (
                  // eslint-disable-next-next/no-img-element
                  <img src={headerMediaUrl} alt="Header Preview" className="max-h-40 w-full object-cover" />
                )}
                {headerFormat !== "IMAGE" && (
                  <div className="p-4 text-center text-xs font-semibold text-gray-500">
                    [{headerFormat} Attachment: {headerMediaUrl}]
                  </div>
                )}
              </div>
            )}

            {/* Header Text */}
            {headerFormat === "TEXT" && previewHeader && (
              <p className="text-xs font-bold mb-1" style={{ color: COLORS.text }}>
                {previewHeader}
              </p>
            )}

            {/* Body */}
            <p className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color: COLORS.text }}>
              {previewText}
            </p>

            {/* Footer */}
            {footerComponent?.text && (
              <p className="mt-2 text-[10px] text-gray-400 border-t pt-1">
                {footerComponent.text}
              </p>
            )}

            <span className="mt-1 block text-right text-[9px]" style={{ color: COLORS.muted }}>
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>

            {/* Buttons */}
            {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
              <div className="mt-2.5 flex flex-col gap-1 border-t pt-2">
                {buttonsComponent.buttons.map((btn, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border p-1.5 text-center text-xs font-semibold text-blue-600 bg-gray-50"
                  >
                    {btn.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send immediately toggle */}
      <label className="flex items-center gap-3 rounded-2xl border p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          checked={sendImmediately}
          onChange={(e) => onSendImmediatelyChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <p className="text-xs font-semibold" style={{ color: COLORS.text }}>
            Send Broadcast Campaign Immediately
          </p>
          <p className="text-[11px]" style={{ color: COLORS.muted }}>
            If unchecked, the broadcast campaign will be created as a Draft.
          </p>
        </div>
      </label>
    </div>
  );
}
