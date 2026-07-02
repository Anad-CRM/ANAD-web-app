"use client";

import { useState, type ReactNode } from "react";
import { CornerUpLeft, Copy, SmilePlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import type { Message, Contact } from "../types";

// WhatsApp's 6 core quick-reaction emojis
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface MessageActionsProps {
  message: Message;
  onReply: () => void;
  onReact: (emoji: string) => void;
  children: ReactNode;
  contact: Contact | null;
}

/**
 * Hover/long-press toolbar wrapper around a `<MessageBubble>`. The bubble
 * itself stays a pure presenter — this component owns the action surface so
 * the bubble's render path is unaffected when the toolbar isn't visible.
 *
 * Emoji picker is styled like WhatsApp: large emoji buttons in a rounded
 * floating panel with subtle shadow + backdrop blur.
 */
export function MessageActions({
  message,
  onReply,
  onReact,
  children,
  contact,
}: MessageActionsProps) {
  // Touch devices have no hover. Long-press fires `contextmenu`; we capture
  // it, suppress the native menu, and pin the toolbar open until the user
  // interacts elsewhere.
  const [touchOpen, setTouchOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const isAgent =
    message.sender_type === "agent" || message.sender_type === "bot";

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setTouchOpen(true);
  };

  const handleCopy = async () => {
    const text = message.content_text ?? "";
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
    setTouchOpen(false);
  };

  const handlePickEmoji = (emoji: string) => {
    onReact(emoji);
    setPickerOpen(false);
    setTouchOpen(false);
  };

  const handleReply = () => {
    onReply();
    setTouchOpen(false);
  };

  const renderAvatar = () => {
    if (isAgent) {
      const isAi = message.name === "AI Agent";
      if (isAi) {
        return (
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm select-none"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
            title="AI Auto Responder"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" />
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" />
              <path d="M8 12.5C8 10.57 9.57 9 11.5 9S15 10.57 15 12.5 13.43 16 11.5 16 8 14.43 8 12.5z" fill="white" opacity="0.9"/>
              <circle cx="11.5" cy="12.5" r="1.5" fill="#7c3aed"/>
            </svg>
          </div>
        );
      }

      const initials = message.name ? message.name.charAt(0).toUpperCase() : "A";
      return (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E56A0] text-[10px] font-bold text-white shadow-sm select-none"
          title={message.name || "Agent"}
        >
          {initials}
        </div>
      );
    } else {
      const displayName = contact?.name || contact?.phone || "Customer";
      const initials = displayName.charAt(0).toUpperCase();
      return (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5A7190] text-[10px] font-bold text-white shadow-sm select-none"
          title={displayName}
        >
          {initials}
        </div>
      );
    }
  };

  // Row alignment lives here (not in MessageBubble) so the `group/actions`
  // hover region matches the bubble's content width — hovering empty space
  // in the row no longer reveals the toolbar.
  return (
    <div
      className={cn(
        "flex w-full items-end gap-2 mb-1",
        isAgent ? "justify-end flex-row-reverse" : "justify-start flex-row",
      )}
      onContextMenu={handleContextMenu}
      onBlur={() => setTouchOpen(false)}
    >
      {renderAvatar()}

      {/* `min-w-0` lets this flex child actually respect the 75% cap. */}
      <div className="group/actions relative min-w-0 max-w-[70%]">
        {children}

        {/* Action toolbar — appears on hover/touch */}
        <div
          data-touch-open={touchOpen || pickerOpen ? "true" : undefined}
          className={cn(
            "absolute -top-8 z-30 flex h-8 items-center gap-0.5 rounded-full",
            "border border-white/20 bg-[#1C2331]/90 px-1.5 shadow-xl backdrop-blur-md",
            "opacity-0 transition-all duration-150",
            "group-hover/actions:opacity-100 group-focus-within/actions:opacity-100",
            "data-[touch-open=true]:opacity-100",
            isAgent ? "right-1" : "left-1",
          )}
        >
          {/* Emoji react button — opens WhatsApp-style picker */}
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                aria-label="React with emoji"
                title="React"
              >
                <SmilePlus className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className={cn(
                "flex w-auto flex-row items-center gap-0.5 rounded-full border-none p-1.5 shadow-2xl",
                "bg-[#1C2331]/95 backdrop-blur-xl",
              )}
              sideOffset={6}
              align={isAgent ? "end" : "start"}
            >
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => handlePickEmoji(e)}
                  title={`React with ${e}`}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-xl",
                    "transition-all duration-150 hover:scale-125 hover:bg-white/10 active:scale-95",
                  )}
                  aria-label={`React with ${e}`}
                >
                  {e}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <div className="mx-0.5 h-4 w-px bg-white/10" />

          {/* Reply button */}
          <button
            type="button"
            onClick={handleReply}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/15 hover:text-white transition-colors"
            aria-label="Reply"
            title="Reply"
          >
            <CornerUpLeft className="h-3.5 w-3.5" />
          </button>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/15 hover:text-white transition-colors"
            aria-label="Copy"
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
