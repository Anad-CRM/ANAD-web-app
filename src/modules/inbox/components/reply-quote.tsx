"use client";

import { X } from "lucide-react";
import { cn } from "../lib/utils";
import type { Message } from "../types";

interface ReplyQuoteProps {
  /** Sender label of the quoted message: "You" for our own messages,
   *  contact name for customer-sent messages. */
  authorLabel: string;
  /** Compact text preview. */
  preview: string;
  /** True when rendered inside an outbound (agent) message bubble. */
  isOutbound?: boolean;
  /** Present → renders the composer-chip variant with an X button. */
  onDismiss?: () => void;
}

export function ReplyQuote({
  authorLabel,
  preview,
  isOutbound,
  onDismiss,
}: ReplyQuoteProps) {
  const isChip = !!onDismiss;
  return (
    <div
      className={cn(
        "flex items-start gap-2 border-l-2 px-2.5 py-1.5 transition-all rounded-md",
        isChip
          ? "bg-[#EEF4FB] border-[#1E56A0] border"
          : isOutbound
          ? "mb-1.5 bg-black/25 border-white/90"
          : "mb-1.5 bg-slate-100/90 border-[#1E56A0]",
      )}
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "truncate text-[11px] font-semibold",
            isChip || !isOutbound ? "text-[#1E56A0]" : "text-white font-bold"
          )}
        >
          {authorLabel}
        </div>
        <div
          className={cn(
            "whitespace-pre-wrap break-words text-xs",
            isChip || !isOutbound ? "text-[#5A7190]" : "text-white/90 font-medium"
          )}
        >
          {preview}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cancel reply"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#5A7190] hover:bg-[#D6E4F0] hover:text-[#0D1B3E]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** Build the one-line preview text shown inside a reply quote. */
export function buildReplyPreview(message: Message): string {
  if (message.content_text) {
    const text = message.content_text.trim();
    if (!text.startsWith("[reaction]:")) return text;
  }
  const type = message.content_type || message.message_type;
  switch (type) {
    case "image":
      return "[Image]";
    case "video":
      return "[Video]";
    case "audio":
    case "voice":
      return "[Voice Note]";
    case "document":
      return "[Document]";
    case "sticker":
      return "[Sticker]";
    case "location":
      return "[Location]";
    case "template":
      return "[Template]";
    default:
      return "[Message]";
  }
}
