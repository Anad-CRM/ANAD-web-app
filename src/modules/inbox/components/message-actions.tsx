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
import type { Message } from "../types";

// WhatsApp's 6 core quick-reaction emojis
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface MessageActionsProps {
  message: Message;
  onReply: () => void;
  onReact: (emoji: string) => void;
  children: ReactNode;
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

  // Row alignment lives here (not in MessageBubble) so the `group/actions`
  // hover region matches the bubble's content width — hovering empty space
  // in the row no longer reveals the toolbar.
  return (
    <div
      className={cn(
        "flex w-full",
        isAgent ? "justify-end" : "justify-start",
      )}
      onContextMenu={handleContextMenu}
      onBlur={() => setTouchOpen(false)}
    >
      {/* `min-w-0` lets this flex child actually respect the 75% cap. */}
      <div className="group/actions relative min-w-0 max-w-[75%]">
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
