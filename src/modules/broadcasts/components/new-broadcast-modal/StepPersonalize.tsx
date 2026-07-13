import { COLORS } from "@/core/components/theme/colors";
import type { MetaTemplate } from "@/modules/broadcasts/types/broadcast.types";

interface StepPersonalizeProps {
  selectedTemplate: MetaTemplate | null;
  placeholders: string[];
  bodyVariables: Record<string, string>;
  onVariableChange: (key: string, val: string) => void;
  previewText: string;
  sendImmediately: boolean;
  onSendImmediatelyChange: (val: boolean) => void;
  onGoToStep1: () => void;
}

/**
 * Step 3 — Variable personalization, live message preview, and send-mode toggle.
 */
export function StepPersonalize({
  selectedTemplate,
  placeholders,
  bodyVariables,
  onVariableChange,
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
          Please go back and select a template first.
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

  return (
    <div className="flex flex-col gap-5">
      {/* Variable inputs */}
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
                    placeholder={`Value for ${ph}…`}
                    value={bodyVariables[num] || ""}
                    onChange={(e) => onVariableChange(num, e.target.value)}
                    className="flex-1 rounded-xl border px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    style={{ borderColor: "#D1D5DB", backgroundColor: "white" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live preview */}
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

      {/* Send immediately toggle */}
      <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          checked={sendImmediately}
          onChange={(e) => onSendImmediatelyChange(e.target.checked)}
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
    </div>
  );
}
