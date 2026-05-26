import React, { useMemo } from "react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

type TrendMap = Record<string, number>;

interface CallsOverTimeChartProps {
  incomingTrend?: TrendMap;
  outgoingTrend?: TrendMap;
  isLoading?: boolean;
}

const formatLabel = (dateKey: string) => {
  const date = new Date(dateKey);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const buildPath = (values: number[], width = 100, height = 100) => {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const stepX = values.length === 1 ? width : width / (values.length - 1);
  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / max) * (height - 12) - 4;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

export const CallsOverTimeChart: React.FC<CallsOverTimeChartProps> = ({
  incomingTrend,
  outgoingTrend,
  isLoading = false,
}) => {
  const series = useMemo(() => {
    const labels = Array.from(
      new Set([
        ...Object.keys(incomingTrend || {}),
        ...Object.keys(outgoingTrend || {}),
      ])
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const incomingValues = labels.map((label) => incomingTrend?.[label] || 0);
    const outgoingValues = labels.map((label) => outgoingTrend?.[label] || 0);

    return {
      labels: labels.slice(-8),
      incomingValues: incomingValues.slice(-8),
      outgoingValues: outgoingValues.slice(-8),
    };
  }, [incomingTrend, outgoingTrend]);

  const hasData = series.labels.length > 0 && (series.incomingValues.some(Boolean) || series.outgoingValues.some(Boolean));
  const incomingPath = buildPath(series.incomingValues);
  const outgoingPath = buildPath(series.outgoingValues);
  const maxCount = Math.max(...series.incomingValues, ...series.outgoingValues, 1);

  return (
    <div className="flex flex-col w-full h-full font-sans">
      <Text as="h3" weight="semibold" className="mb-4 ml-1" style={{ fontSize: "16px", color: COLORS.text }}>
        Calls Over Time
      </Text>

      <div
        className="rounded-[32px] p-4 sm:p-6 lg:p-8 relative w-full min-h-[280px] sm:min-h-[320px] flex flex-col justify-between shadow-inner border border-white/50"
        style={{ backgroundColor: "#D6E4F0" }}
      >
        {isLoading ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-3" style={{ color: COLORS.muted }}>
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: `${COLORS.primary}22`, borderTopColor: COLORS.primary }}
            />
            <Text size="sm">Loading call trends...</Text>
          </div>
        ) : !hasData ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-2" style={{ color: COLORS.muted }}>
            <Text size="sm">No trend data available</Text>
          </div>
        ) : (
          <div className="relative w-full flex-1 pb-10 pl-8 pr-2 sm:pr-4">
            <div className="absolute top-0 bottom-10 left-0 w-full flex flex-col justify-between pointer-events-none">
              {[1, 2, 3, 4].map((tick) => {
                const value = Math.round((maxCount / 4) * tick);
                return (
                  <div key={tick} className="flex items-center w-full h-0 relative">
                    <Text weight="bold" className="absolute left-0 w-[24px] pr-2 text-right" style={{ fontSize: "12px", color: COLORS.muted }}>
                      {value}
                    </Text>
                    <div className="absolute left-[32px] right-0 h-[1px] opacity-50" style={{ backgroundColor: COLORS.border }} />
                  </div>
                );
              })}
            </div>

            <div className="absolute top-0 left-[32px] right-0 bottom-10 z-10 pt-[10px]">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d={incomingPath} fill="none" stroke={COLORS.info} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={outgoingPath} fill="none" stroke={COLORS.primaryDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {series.labels.map((_, index) => {
                  const stepX = series.labels.length === 1 ? 100 : 100 / (series.labels.length - 1);
                  const x = index * stepX;
                  const incomingY = 100 - (series.incomingValues[index] / maxCount) * 88 - 4;
                  const outgoingY = 100 - (series.outgoingValues[index] / maxCount) * 88 - 4;
                  return (
                    <g key={`${series.labels[index]}-${index}`}>
                      <circle cx={x} cy={incomingY} r="1.6" fill={COLORS.info} />
                      <circle cx={x} cy={outgoingY} r="1.6" fill={COLORS.primaryDark} />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="absolute bottom-5 left-[32px] right-0 flex justify-between gap-1 px-1">
              {series.labels.map((label) => (
                <Text key={label} weight="bold" className="whitespace-nowrap" style={{ fontSize: "11px", color: COLORS.muted }}>
                  {formatLabel(label)}
                </Text>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 sm:gap-8 ml-1 sm:ml-8">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS.info }} />
            <Text weight="bold" style={{ fontSize: "12px", color: COLORS.muted }}>Incoming</Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS.primaryDark }} />
            <Text weight="bold" style={{ fontSize: "12px", color: COLORS.muted }}>Outgoing</Text>
          </div>
        </div>
      </div>
    </div>
  );
};
