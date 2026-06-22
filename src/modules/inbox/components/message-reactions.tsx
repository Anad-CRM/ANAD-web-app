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

  const totalCount = reactions.length;
  const hasCurrentUserReacted = groups.some((g) => g.byCurrentUser);
  // Find which emoji the current user reacted with, so we can toggle/remove it
  const currentUserEmoji = groups.find((g) => g.byCurrentUser)?.emoji;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any bubble click handlers
    if (currentUserEmoji) {
      onToggle(currentUserEmoji);
    } else {
      onToggle(groups[0].emoji);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 select-none",
        hasCurrentUserReacted
          ? "border-[#1E56A0]/45 bg-[#E8F1FC] text-[#1E56A0]"
          : "border-[#D6E4F0] bg-white text-[#5A7190]",
      )}
    >
      <div className="flex items-center -space-x-0.5">
        {groups.map((g) => (
          <span key={g.emoji} className="text-xs leading-none select-none">
            {g.emoji}
          </span>
        ))}
      </div>
      {totalCount > 1 && (
        <span className="pl-0.5 text-[9px] font-bold leading-none">{totalCount}</span>
      )}
    </button>
  );
}
