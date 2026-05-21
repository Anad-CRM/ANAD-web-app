"use client";

import React, { useState } from "react";
import { completeFollowUp } from "../api/followUpApi";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

interface CompleteModalProps {
  followUpId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompleteModal({ followUpId, onClose, onSuccess }: CompleteModalProps) {
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      setError("Please enter remarks");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await completeFollowUp(followUpId, remarks.trim());
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Complete error:", err);
      setError("Failed to complete follow-up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-[24px] sm:rounded-[24px] shadow-2xl w-[min(100vw-1rem,440px)] sm:w-full max-w-[440px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-6 pb-2">
          <Text as="h2" weight="bold" size="lg" style={{ color: COLORS.text }}>Complete Follow-up</Text>
          <Text as="p" size="sm" className="mt-1" style={{ color: COLORS.muted }}>Add remarks to mark this follow-up as completed</Text>
        </div>

        <div className="px-5 sm:px-6 pb-6 flex flex-col gap-4 mt-2">
          {/* Remarks Input */}
          <div>
            <Text as="label" size="sm" weight="semibold" className="block mb-1.5" style={{ color: COLORS.text }}>
              Remarks <span style={{ color: COLORS.danger }}>*</span>
            </Text>
            <textarea
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter remarks..."
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border text-[14px] outline-none resize-none transition-colors ${
                error
                  ? "border-red-400 bg-red-50 focus:border-red-500"
                  : "border-gray-200 bg-gray-50 focus:bg-white"
              }`}
              style={{ boxShadow: error ? undefined : `0 0 0 2px transparent`, borderColor: error ? undefined : COLORS.border }}
            />
            {error && <Text as="p" size="xs" className="mt-1" style={{ color: COLORS.danger }}>{error}</Text>}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-[14px] hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-[14px] hover:opacity-90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: COLORS.primaryDark }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Completing...
                </>
              ) : (
                "Complete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
