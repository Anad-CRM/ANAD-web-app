"use client";

import { useMemo } from "react";
import { cn } from "../lib/utils";
import type { MessageReaction } from "../types";

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId: string | undefined;
  /** Toggle the agent's reaction. If the agent already has this emoji →
   *  caller should send empty to remove; otherwise swap/add. */
  onToggle: (emoji: string) => void;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  byCurrentUser: boolean;
}

function groupReactions(
  reactions: MessageReaction[],
  currentUserId: string | undefined,
): ReactionGroup[] {
  const map = new Map<string, ReactionGroup>();
  for (const r of reactions) {
    const existing = map.get(r.emoji);
    const isMine =
      r.actor_type === "agent" &&
      !!currentUserId &&
      r.actor_id === currentUserId;
    if (existing) {
      existing.count += 1;
      existing.byCurrentUser = existing.byCurrentUser || isMine;
    } else {
      map.set(r.emoji, { emoji: r.emoji, count: 1, byCurrentUser: isMine });
    }
  }
  return [...map.values()];
}

export function MessageReactions({
  reactions,
  currentUserId,
  onToggle,
}: MessageReactionsProps) {
  const groups = useMemo(
    () => groupReactions(reactions, currentUserId),
    [reactions, currentUserId],
  );

  if (groups.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {groups.map((g) => (
        <button
          key={g.emoji}
          type="button"
          title={g.byCurrentUser ? "Click to remove your reaction" : `React with ${g.emoji}`}
          onClick={(e) => {
            e.stopPropagation();
            // Toggle: if this is the user's own emoji, remove it; otherwise add/swap
            onToggle(g.byCurrentUser ? "" : g.emoji);
          }}
          className={cn(
            // WhatsApp-style pill: compact, rounded, border, shadow
            "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] leading-none shadow-sm",
            "transition-all duration-150 select-none",
            "hover:scale-110 active:scale-95",
            // Highlight own reaction with blue tint (like WhatsApp)
            g.byCurrentUser
              ? "border-[#1E56A0]/50 bg-[#DCE8F8] text-[#1E56A0] font-semibold"
              : "border-[#D0D7DE] bg-white/95 text-[#444] font-medium",
          )}
        >
          <span className="text-sm leading-none">{g.emoji}</span>
          {g.count > 1 && (
            <span className={cn(
              "text-[9px] font-bold leading-none",
              g.byCurrentUser ? "text-[#1E56A0]" : "text-[#666]",
            )}>
              {g.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
