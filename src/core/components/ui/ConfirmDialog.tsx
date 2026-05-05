import React from "react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

export interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: "rgba(13,27,62,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[310px] rounded-2xl p-5 text-center shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: COLORS.surface }}
        onClick={e => e.stopPropagation()}
      >
        <Text as="p" size="custom" weight="bold" className="text-[16px] mb-2" style={{ color: COLORS.text }}>
          {title}
        </Text>
        <Text as="p" size="custom" className="text-[13px] leading-relaxed mb-6" style={{ color: COLORS.muted }}>
          {message}
        </Text>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:bg-gray-100 border border-gray-200"
            style={{ color: COLORS.text }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 shadow-md shadow-blue-500/20"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
