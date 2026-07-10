import React from "react";
import { CheckCircle2 } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

const STEP_LABELS = ["Template", "Audience", "Personalize"] as const;

interface StepProgressProps {
  currentStep: number;
}

/**
 * Renders the 3-step progress indicator at the top of the modal.
 */
export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, idx) => {
        const s = idx + 1;
        const active = s === currentStep;
        const done = s < currentStep;

        return (
          <React.Fragment key={s}>
            <div className="flex items-center gap-1.5">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors"
                style={{
                  backgroundColor: s <= currentStep ? COLORS.primary : "#E5E7EB",
                  color: s <= currentStep ? "white" : COLORS.muted,
                }}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
              </div>
              <span
                className="text-[11px] font-semibold hidden sm:block"
                style={{ color: active ? COLORS.primary : COLORS.muted }}
              >
                {label}
              </span>
            </div>
            {s < STEP_LABELS.length && (
              <div
                className="h-0.5 flex-1 rounded-full transition-colors"
                style={{ backgroundColor: done ? COLORS.primary : "#E5E7EB" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
