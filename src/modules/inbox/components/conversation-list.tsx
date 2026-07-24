"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn, createClient, parseSafeDate } from "../lib/utils";
import type { Conversation, ConversationStatus } from "../types";
import { Search, ChevronDown, MessageSquareText } from "lucide-react";
import { isToday, isYesterday, format } from "date-fns";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";


interface ConversationListProps {
  activeConversationId: string | null;
  onSelect: (conversation: Conversation) => void;
  conversations: Conversation[];
  onConversationsLoaded: (conversations: Conversation[]) => void;
  /**
   * Increment to force the fetch effect below to refire. The parent
   * bumps this on realtime reconnect / tab visibility → visible so the
   * list catches up on any events sent while the WS was disconnected
   * or the tab was throttled. Optional so existing callers keep working.
   */
  resyncToken?: number;
}

const STATUS_COLORS: Record<ConversationStatus, string> = {
  open: "bg-primary",
  pending: "bg-amber-500",
  closed: "bg-slate-500",
};

const FILTER_OPTIONS: { label: string; value: ConversationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Pending", value: "pending" },
  { label: "Closed", value: "closed" },
];

export function ConversationList({
  activeConversationId,
  onSelect,
  conversations,
  onConversationsLoaded,
  resyncToken = 0,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationStatus | "all">("all");
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'instagram'>('all');
  const [loading, setLoading] = useState(true);


  const onConversationsLoadedRef = useRef(onConversationsLoaded);
  useEffect(() => {
    onConversationsLoadedRef.current = onConversationsLoaded;
  });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, contact:contacts(*)")
        .order("last_message_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        // Supabase errors have non-enumerable properties — log fields explicitly
        console.error("Failed to fetch conversations:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setLoading(false);
        return;
      }

      onConversationsLoadedRef.current(data ?? []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // `resyncToken` is included so the parent can force a refetch when
    // the realtime channel reconnects or the tab regains focus — catches
    // up on any events sent while the WS was disconnected or throttled.
  }, [resyncToken]);

  const filtered = useMemo(() => {
    let result = conversations;

    if (filter !== "all") {
      result = result.filter((c) => c.status === filter);
    }

    // Channel filter: default whatsapp if not set
    if (channelFilter !== 'all') {
      result = result.filter((c) => (c.channel || 'whatsapp') === channelFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => {
        const name = c.contact?.name?.toLowerCase() ?? "";
        const phone = c.contact?.phone?.toLowerCase() ?? "";
        const lastMsg = c.last_message_text?.toLowerCase() ?? "";
        return name.includes(q) || phone.includes(q) || lastMsg.includes(q);
      });
    }

    return result;
  }, [conversations, filter, channelFilter, search]);


  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleSelect = useCallback(
    (conv: Conversation) => {
      onSelect(conv);
    },
    [onSelect]
  );

  const activeFilter = FILTER_OPTIONS.find((o) => o.value === filter);

  return (
    // w-full on mobile so the list occupies the whole viewport when it's
    // the single pane showing; fixed 320px on desktop where it shares the
    // row with the thread + contact sidebar.
    <div className="flex h-full w-full flex-col border-r border-[#D6E4F0] bg-[#F6F6F6] lg:w-80">
      {/* Search + Filter */}
      <div className="space-y-2 border-b border-[#D6E4F0] p-3 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8BA5C0]" />
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search conversations..."
            className="border-[#D6E4F0] bg-[#F6F6F6] pl-9 text-sm text-[#0D1B3E] placeholder-[#8BA5C0] focus:border-[#1E56A0]/50 focus:bg-white"
          />
        </div>

        {/* Channel filter pills */}
        <div className="flex items-center gap-1.5">
          {(['all', 'whatsapp', 'instagram'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all",
                channelFilter === ch
                  ? ch === 'instagram'
                    ? 'text-white shadow-sm'
                    : 'bg-[#1E56A0] text-white'
                  : 'bg-[#F0F4FA] text-[#5A7190] hover:bg-[#E2EAF5]'
              )}
              style={channelFilter === ch && ch === 'instagram' ? {
                background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)'
              } : undefined}
            >
              {ch === 'all' && <MessageSquareText className="h-3 w-3" />}
              {ch === 'whatsapp' && <img src="/whatsapp.png" alt="" className="h-3 w-3 object-contain" />}
              {ch === 'instagram' && <img src="/instagram.png" alt="" className="h-3 w-3 object-contain" style={channelFilter === 'instagram' ? { filter: 'brightness(0) invert(1)' } : {}} />}
              {ch === 'all' ? 'All' : ch === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
            </button>
          ))}
        </div>

        <DropdownMenu>

          <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 gap-1 px-2 text-xs text-[#5A7190] hover:text-[#0D1B3E] rounded-md hover:bg-[#EEF4FB] transition-colors">
            {activeFilter?.label ?? "All"}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="border-[#D6E4F0] bg-white shadow-lg"
          >
            {FILTER_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  "text-sm cursor-pointer hover:bg-[#EEF4FB] text-[#0D1B3E]",
                  filter === opt.value
                    ? "text-[#1E56A0] font-semibold bg-[#EEF4FB]"
                    : "text-[#0D1B3E]"
                )}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Conversation Items */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1E56A0] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-[#8BA5C0]">No conversations found</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (conversation: Conversation) => void;
}

function formatLastMessageText(text: string | null | undefined): string {
  if (!text) return "No messages yet";
  const clean = text.trim().toLowerCase();
  if (clean === "[image]") return "📷 Photo";
  if (clean === "[sticker]") return "💟 Sticker";
  if (clean === "[voice note]" || clean === "[audio]" || clean === "[voice]") return "🎵 Voice Note";
  if (clean === "[video]") return "🎥 Video";
  if (clean === "[document]") return "📄 Document";
  if (clean === "[reaction]" || clean.startsWith("[reaction]:")) return "❤️ Reaction";
  return text;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: ConversationItemProps) {
  const contact = conversation.contact;
  const displayName = contact?.name || contact?.phone || contact?.phone_number || "Unknown";
  const initials = displayName.charAt(0).toUpperCase();

  const handleClick = useCallback(() => {
    onSelect(conversation);
  }, [onSelect, conversation]);

  let timeAgo = "";
  if (conversation.last_message_at) {
    const d = parseSafeDate(conversation.last_message_at);
    if (!isNaN(d.getTime())) {
      if (isToday(d)) {
        timeAgo = format(d, "h:mm a");
      } else if (isYesterday(d)) {
        timeAgo = "Yesterday";
      } else {
        timeAgo = format(d, "MMM d");
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-[#EEF4FB]/30",
        isActive && "border-l-2 border-[#1E56A0] bg-[#EEF4FB]/70 hover:bg-[#EEF4FB]/70"
      )}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E56A0] text-sm font-semibold text-white">
        {contact?.avatar_url ? (
          <img
            src={contact.avatar_url}
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-[#0D1B3E]">
            {displayName}
          </span>
          <span className="shrink-0 text-[10px] font-medium text-[#8BA5C0]">{timeAgo}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-[#5A7190] font-medium">
            {formatLastMessageText(conversation.last_message_text)}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {conversation.unread_count > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#25D366] px-1 text-[10px] font-bold text-white">
                {conversation.unread_count > 9 ? "10+" : conversation.unread_count}
              </span>
            )}
            {/* Channel badge */}
            {conversation.channel === 'instagram' ? (
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full"
                title="Instagram DM"
                style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
              >
                <img src="/instagram.png" alt="IG" className="h-2.5 w-2.5 object-contain brightness-0 invert" />
              </span>
            ) : (
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full bg-[#25D366]"
                title="WhatsApp"
              >
                <img src="/whatsapp.png" alt="WA" className="h-2.5 w-2.5 object-contain brightness-0 invert" />
              </span>
            )}
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                STATUS_COLORS[conversation.status]
              )}
              title={conversation.status}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
