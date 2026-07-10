import { Loader2 } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import type { MetaTemplate } from "@/modules/broadcasts/types/broadcast.types";

interface StepTemplateProps {
  campaignName: string;
  onCampaignNameChange: (val: string) => void;
  templates: MetaTemplate[];
  selectedTemplate: MetaTemplate | null;
  onSelectTemplate: (tpl: MetaTemplate) => void;
  loadingTemplates: boolean;
}

/**
 * Step 1 — Campaign name + template selection.
 */
export function StepTemplate({
  campaignName,
  onCampaignNameChange,
  templates,
  selectedTemplate,
  onSelectTemplate,
  loadingTemplates,
}: StepTemplateProps) {
  return (
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
          onChange={(e) => onCampaignNameChange(e.target.value)}
          className="rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none"
          style={{ borderColor: "#D1D5DB" }}
        />
      </div>

      {/* Template Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
          Select Message Template
        </label>

        {loadingTemplates ? (
          <div className="flex items-center gap-2 py-3 text-xs" style={{ color: COLORS.muted }}>
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: COLORS.primary }} />
            Loading approved templates…
          </div>
        ) : templates.length === 0 ? (
          <div
            className="rounded-xl border border-dashed p-4 text-center text-xs"
            style={{ color: COLORS.muted }}
          >
            No approved templates found in Meta.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelectTemplate(tpl)}
                  className="flex flex-col text-left rounded-xl border p-3.5 transition-all"
                  style={{
                    borderColor: isSelected ? COLORS.primary : "#E5E7EB",
                    backgroundColor: isSelected ? `${COLORS.primary}06` : "white",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
                      {tpl.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: "#DEF7EC", color: "#03543F" }}
                    >
                      {tpl.language}
                    </span>
                  </div>
                  <p className="mt-1 text-xs line-clamp-2" style={{ color: COLORS.muted }}>
                    {tpl.components.find((c) => c.type === "BODY")?.text || "No preview text"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
