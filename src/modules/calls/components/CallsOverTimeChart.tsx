import React, { useMemo, useState } from "react";
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
  
  if (dateKey.includes("T")) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Build a smooth cubic bezier path from values
const buildSmoothPath = (values: number[], maxVal: number, W = 500, H = 180, padX = 0, padY = 12) => {
  if (values.length === 0) return { line: "", area: "" };
  const n = values.length;
  const stepX = n === 1 ? W : W / (n - 1);

  const pts = values.map((v, i) => ({
    x: padX + i * stepX,
    y: H - padY - ((v / maxVal) * (H - padY * 2)),
  }));

  if (n === 1) {
    const line = `M ${pts[0].x},${pts[0].y} L ${pts[0].x + 1},${pts[0].y}`;
    const area = `M ${pts[0].x},${H} L ${pts[0].x},${pts[0].y} L ${pts[0].x + 1},${pts[0].y} L ${pts[0].x + 1},${H} Z`;
    return { line, area };
  }

  // Catmull-Rom → cubic bezier control points
  let line = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, n - 1)];
    const t = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    line += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  const area = `${line} L ${pts[n - 1].x.toFixed(2)},${H} L ${pts[0].x.toFixed(2)},${H} Z`;
  return { line, area };
};

export const CallsOverTimeChart: React.FC<CallsOverTimeChartProps> = ({
  incomingTrend,
  outgoingTrend,
  isLoading = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  const W = 500;
  const H = 180;
  const padX = 0;
  const padY = 16;
  const n = series.labels.length;
  const stepX = n <= 1 ? W : W / (n - 1);

  const hasData =
    series.labels.length > 0 &&
    (series.incomingValues.some(Boolean) || series.outgoingValues.some(Boolean));

  const maxCount = Math.max(...series.incomingValues, ...series.outgoingValues, 1);

  const { line: incomingLine, area: incomingArea } = buildSmoothPath(series.incomingValues, maxCount, W, H, padX, padY);
  const { line: outgoingLine, area: outgoingArea } = buildSmoothPath(series.outgoingValues, maxCount, W, H, padX, padY);

  const gridTicks = [0.25, 0.5, 0.75, 1].map((r) => ({
    value: Math.round(maxCount * r),
    y: H - padY - r * (H - padY * 2),
  }));

  const getPointCoords = (values: number[], index: number) => ({
    x: padX + index * stepX,
    y: H - padY - ((values[index] / maxCount) * (H - padY * 2)),
  });

  return (
    <div className="flex flex-col w-full h-full font-sans">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5 px-1">
        <Text as="h3" weight="semibold" style={{ fontSize: "16px", color: COLORS.text }}>
          Calls Over Time
        </Text>

        {/* Legend */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-[3px] w-6 rounded-full" style={{ backgroundColor: COLORS.info }} />
              <div className="h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: COLORS.info }} />
            </div>
            <span className="text-xs font-semibold tracking-wide" style={{ color: COLORS.muted }}>Incoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-[3px] w-6 rounded-full" style={{ backgroundColor: COLORS.primaryDark }} />
              <div className="h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: COLORS.primaryDark }} />
            </div>
            <span className="text-xs font-semibold tracking-wide" style={{ color: COLORS.muted }}>Outgoing</span>
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        className="relative w-full flex-1 rounded-[28px] overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #e8f2fb 0%, #d0e4f6 40%, #c4d9f0 100%)",
          boxShadow: "inset 0 2px 8px rgba(30,86,160,0.08), 0 4px 24px rgba(30,86,160,0.10)",
          minHeight: 280,
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-40px] right-[-30px] w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #1E56A0 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20px] left-[10%] w-28 h-28 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)" }} />

        {isLoading ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-4">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-[3px] border-blue-200 opacity-40" />
              <div
                className="absolute inset-0 rounded-full border-[3px] border-t-transparent animate-spin"
                style={{ borderColor: `${COLORS.primary}33`, borderTopColor: COLORS.primary }}
              />
            </div>
            <span className="text-sm font-medium" style={{ color: COLORS.muted }}>Loading call trends…</span>
          </div>
        ) : !hasData ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-30">
              <rect x="4" y="24" width="6" height="12" rx="2" fill={COLORS.primary} />
              <rect x="14" y="16" width="6" height="20" rx="2" fill={COLORS.info} />
              <rect x="24" y="20" width="6" height="16" rx="2" fill={COLORS.primary} />
              <rect x="34" y="10" width="6" height="26" rx="2" fill={COLORS.info} />
            </svg>
            <span className="text-sm font-medium" style={{ color: COLORS.muted }}>No trend data for this period</span>
          </div>
        ) : (
          <div className="relative w-full h-full p-4 sm:p-6" style={{ minHeight: 260 }}>
            {/* Y-axis labels */}
            <div className="absolute left-3 top-4 bottom-10 flex flex-col justify-between pointer-events-none">
              {[...gridTicks].reverse().map((tick, i) => (
                <span key={i} className="text-[10px] font-semibold tabular-nums" style={{ color: COLORS.subtle }}>
                  {tick.value}
                </span>
              ))}
            </div>

            {/* SVG Chart area */}
            <div className="absolute left-9 right-3 top-4 bottom-10">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                style={{ overflow: "visible" }}
              >
                <defs>
                  {/* Incoming gradient fill */}
                  <linearGradient id="incomingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.info} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={COLORS.info} stopOpacity="0.02" />
                  </linearGradient>
                  {/* Outgoing gradient fill */}
                  <linearGradient id="outgoingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primaryDark} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={COLORS.primaryDark} stopOpacity="0.02" />
                  </linearGradient>
                  {/* Glow filters */}
                  <filter id="incomingGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="outgoingGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  {/* Dot shadow */}
                  <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={COLORS.info} floodOpacity="0.5" />
                  </filter>
                  <filter id="dotShadow2" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={COLORS.primaryDark} floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Grid lines */}
                {gridTicks.map((tick, i) => (
                  <line
                    key={i}
                    x1={0} y1={tick.y}
                    x2={W} y2={tick.y}
                    stroke="rgba(30,86,160,0.10)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                ))}

                {/* Vertical hover line */}
                {hoveredIndex !== null && (
                  <line
                    x1={padX + hoveredIndex * stepX}
                    y1={0}
                    x2={padX + hoveredIndex * stepX}
                    y2={H}
                    stroke="rgba(30,86,160,0.20)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Area fills */}
                <path d={incomingArea} fill="url(#incomingFill)" />
                <path d={outgoingArea} fill="url(#outgoingFill)" />

                {/* Lines */}
                <path
                  d={incomingLine}
                  fill="none"
                  stroke={COLORS.info}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#incomingGlow)"
                />
                <path
                  d={outgoingLine}
                  fill="none"
                  stroke={COLORS.primaryDark}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#outgoingGlow)"
                />

                {/* Data points + hover targets */}
                {series.labels.map((_, index) => {
                  const inc = getPointCoords(series.incomingValues, index);
                  const out = getPointCoords(series.outgoingValues, index);
                  const isHovered = hoveredIndex === index;
                  return (
                    <g key={`pt-${index}`}>
                      {/* Invisible wide hit area */}
                      <rect
                        x={padX + index * stepX - stepX / 2}
                        y={0}
                        width={stepX}
                        height={H}
                        fill="transparent"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{ cursor: "crosshair" }}
                      />

                      {/* Incoming dot */}
                      {isHovered && (
                        <circle cx={inc.x} cy={inc.y} r="7" fill={COLORS.info} opacity="0.18" />
                      )}
                      <circle
                        cx={inc.x} cy={inc.y}
                        r={isHovered ? 5 : 3.5}
                        fill={COLORS.info}
                        stroke="white"
                        strokeWidth="2"
                        filter={isHovered ? "url(#dotShadow)" : undefined}
                        style={{ transition: "r 0.15s ease" }}
                      />

                      {/* Outgoing dot */}
                      {isHovered && (
                        <circle cx={out.x} cy={out.y} r="7" fill={COLORS.primaryDark} opacity="0.18" />
                      )}
                      <circle
                        cx={out.x} cy={out.y}
                        r={isHovered ? 5 : 3.5}
                        fill={COLORS.primaryDark}
                        stroke="white"
                        strokeWidth="2"
                        filter={isHovered ? "url(#dotShadow2)" : undefined}
                        style={{ transition: "r 0.15s ease" }}
                      />

                      {/* Tooltip */}
                      {isHovered && (() => {
                        const tooltipX = Math.min(Math.max(inc.x - 44, 0), W - 90);
                        const tooltipY = Math.min(inc.y, out.y) - 52;
                        return (
                          <g>
                            <rect
                              x={tooltipX} y={Math.max(tooltipY, 2)}
                              width="90" height="44"
                              rx="7" ry="7"
                              fill={COLORS.primaryDark}
                              opacity="0.92"
                            />
                            <text x={tooltipX + 10} y={Math.max(tooltipY, 2) + 15}
                              fill="white" fontSize="9" fontWeight="600" opacity="0.8">
                              {formatLabel(series.labels[index])}
                            </text>
                            <circle cx={tooltipX + 10} cy={Math.max(tooltipY, 2) + 28} r="3.5" fill={COLORS.info} />
                            <text x={tooltipX + 18} y={Math.max(tooltipY, 2) + 32}
                              fill="white" fontSize="9" fontWeight="700">
                              In: {series.incomingValues[index]}
                            </text>
                            <circle cx={tooltipX + 55} cy={Math.max(tooltipY, 2) + 28} r="3.5" fill="#93c5fd" />
                            <text x={tooltipX + 63} y={Math.max(tooltipY, 2) + 32}
                              fill="white" fontSize="9" fontWeight="700">
                              Out: {series.outgoingValues[index]}
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-2 left-9 right-3 flex justify-between">
              {series.labels.map((label, i) => (
                <span
                  key={label}
                  className="text-[10px] font-semibold whitespace-nowrap transition-colors duration-150"
                  style={{
                    color: hoveredIndex === i ? COLORS.primary : COLORS.subtle,
                    fontWeight: hoveredIndex === i ? 700 : 600,
                  }}
                >
                  {formatLabel(label)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
