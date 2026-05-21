"use client";

import React, { useState } from "react";
import { rescheduleFollowUp } from "../api/followUpApi";

interface RescheduleModalProps {
  followUpId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RescheduleModal({ followUpId, onClose, onSuccess }: RescheduleModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; remarks?: string }>({});

  const validate = () => {
    const newErrors: { date?: string; remarks?: string } = {};
    if (!date) newErrors.date = "Please select a date";
    if (!remarks.trim()) newErrors.remarks = "Please enter remarks";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const dateTime = time
        ? new Date(`${date}T${time}:00`).toISOString()
        : new Date(`${date}T00:00:00`).toISOString();

      await rescheduleFollowUp(followUpId, {
        followUpDate: dateTime,
        remarks: remarks.trim(),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Reschedule error:", error);
      setErrors({ remarks: "Failed to reschedule follow-up. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-[440px] mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[18px] font-bold text-[#1E293B]">Reschedule Follow-up</h2>
          <p className="text-[13px] text-gray-500 mt-1">Select a new date and add remarks</p>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4 mt-2">
          {/* Date Input */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              New Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className={`w-full px-4 py-2.5 rounded-xl border text-[14px] outline-none transition-colors ${
                errors.date
                  ? "border-red-400 bg-red-50 focus:border-red-500"
                  : "border-gray-200 bg-gray-50 focus:border-[#233A78] focus:bg-white"
              }`}
            />
            {errors.date && <p className="text-[12px] text-red-500 mt-1">{errors.date}</p>}
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Time <span className="text-gray-400 text-[11px]">(optional)</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[14px] outline-none focus:border-[#233A78] focus:bg-white transition-colors"
            />
          </div>

          {/* Remarks Input */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (errors.remarks) setErrors((prev) => ({ ...prev, remarks: undefined }));
              }}
              placeholder="Enter remarks..."
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border text-[14px] outline-none resize-none transition-colors ${
                errors.remarks
                  ? "border-red-400 bg-red-50 focus:border-red-500"
                  : "border-gray-200 bg-gray-50 focus:border-[#233A78] focus:bg-white"
              }`}
            />
            {errors.remarks && <p className="text-[12px] text-red-500 mt-1">{errors.remarks}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
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
              className="flex-1 py-3 rounded-xl bg-[#4B73B2] text-white font-semibold text-[14px] hover:bg-[#3d6098] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Rescheduling...
                </>
              ) : (
                "Reschedule"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
