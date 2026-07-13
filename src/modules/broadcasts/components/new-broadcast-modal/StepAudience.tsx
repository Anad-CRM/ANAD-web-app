import { COLORS } from "@/core/components/theme/colors";
import { LEAD_STATUSES } from "@/modules/broadcasts/constants/broadcastConstants";

interface StepAudienceProps {
  audienceType: string;
  onAudienceTypeChange: (val: string) => void;
}

/**
 * Step 2 — Target audience selection by lead status.
 */
export function StepAudience({ audienceType, onAudienceTypeChange }: StepAudienceProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: COLORS.text }}>
          Select Target Audience
        </label>
        <p className="text-xs -mt-1" style={{ color: COLORS.muted }}>
          Choose which leads should receive this broadcast.
        </p>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {LEAD_STATUSES.map((status) => {
            const isSelected = audienceType === status.value;
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => onAudienceTypeChange(status.value)}
                className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all"
                style={{
                  borderColor: isSelected ? COLORS.primary : "#E5E7EB",
                  backgroundColor: isSelected ? `${COLORS.primary}06` : "white",
                  color: isSelected ? COLORS.primary : COLORS.text,
                }}
              >
                <span>{status.label}</span>
                <div
                  className="flex h-4 w-4 items-center justify-center rounded-full border"
                  style={{ borderColor: isSelected ? COLORS.primary : "#CBD5E1" }}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
