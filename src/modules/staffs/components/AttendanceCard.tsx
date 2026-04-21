"use client";

import React, { useState } from "react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { ArrowRightIcon } from "./icons";
import type { AttendanceLog } from "../types/staff.types";

interface AttendanceCardProps {
  logs: AttendanceLog[];
}

export function AttendanceCard({ logs }: AttendanceCardProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const presentDates = new Set(
    logs
      .filter((l) => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((l) => new Date(l.createdAt).getDate())
  );

  const presentCount = presentDates.size;
  const pct = Math.round((presentCount / daysInMonth) * 100);

  return (
    <div
      style={{ backgroundColor: COLORS.primary }}
      className="rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Text size="custom" className="text-[18px] text-white font-medium">Attendance</Text>
        <Text size="custom" className="text-[14px] font-light tracking-wide" style={{ color: COLORS.primaryLight }}>
          This Month
        </Text>
      </div>

      {/* Progress bar */}
      <div
        style={{ backgroundColor: COLORS.primaryDark }}
        className="w-full rounded-full h-7 mb-5 border border-white/5 shadow-inner overflow-hidden relative"
      >
        <div
          style={{ width: `${pct}%`, backgroundColor: COLORS.primaryLight }}
          className="h-full rounded-full absolute top-0 left-0 transition-all duration-1000 ease-out"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <Text size="custom" className="text-[13px] font-light" style={{ color: COLORS.primaryLight }}>
          Attendance Rate : {presentCount}/{daysInMonth} days
        </Text>
        <button
          onClick={() => setShowCalendar((v) => !v)}
          className="flex items-center gap-1.5 text-[14px] text-white font-medium hover:opacity-80 transition-opacity tracking-wide"
        >
          View Details <ArrowRightIcon />
        </button>
      </div>

      {/* Expandable Calendar */}
      {showCalendar && (
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <Text key={d} size="custom" className="text-[11px] font-medium mb-1" style={{ color: COLORS.subtle }}>
                {d}
              </Text>
            ))}
            {Array(new Date(year, month, 1).getDay())
              .fill(null)
              .map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isPresent = presentDates.has(day);
              const isSunday = new Date(year, month, day).getDay() === 0;
              const isFuture = new Date(year, month, day) > now;

              let bg = "transparent";
              let color = COLORS.subtle;

              if (!isFuture) {
                if (isPresent) {
                  bg = COLORS.primaryLight;
                  color = COLORS.primaryDark;
                } else if (isSunday) {
                  color = COLORS.danger;
                } else {
                  bg = "rgba(255,255,255,0.05)";
                  color = "#94A3B8";
                }
              }

              return (
                <div
                  key={day}
                  style={{ backgroundColor: bg, color }}
                  className="w-full py-1 text-[12px] flex items-center justify-center rounded-md font-medium"
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
