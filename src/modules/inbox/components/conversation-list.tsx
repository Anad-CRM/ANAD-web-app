"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn, parseSafeDate } from "../lib/utils";
import type { Conversation, ConversationStatus } from "../types";
import { Search, ChevronDown, ChevronRight, MessageSquareText } from "lucide-react";
import { isToday, isYesterday, format, differenceInMinutes, differenceInHours } from "date-fns";
import { COLORS } from "@/core/components/theme/colors";
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
  resyncToken?: number;
  loading?: boolean;
}

const FILTER_OPTIONS: { label: string; value: ConversationStatus | "all" }[] = [
  { label: "All Status", value: "all" },
  { label: "Open", value: "open" },
  { label: "Pending", value: "pending" },
  { label: "Closed", value: "closed" },
];

/* ─── Clean SVG Icons ─────────────────────────────────────────────────────── */
function WhatsAppIcon({ className = "h-4 w-4", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export function ConversationList({
  activeConversationId,
  onSelect,
  conversations,
  onConversationsLoaded,
  resyncToken: _resyncToken = 0,
  loading: externalLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationStatus | "all">("all");
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'instagram'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all');
  const [internalLoading, setInternalLoading] = useState(true);

  const onConversationsLoadedRef = useRef(onConversationsLoaded);
  useEffect(() => {
    onConversationsLoadedRef.current = onConversationsLoaded;
  });

  useEffect(() => {
    if (conversations.length > 0) {
      setInternalLoading(false);
    }
  }, [conversations]);

  const isLoading = externalLoading ?? (internalLoading && conversations.length === 0);

  const filtered = useMemo(() => {
    let result = conversations;

    if (filter !== "all") {
      result = result.filter((c) => c.status === filter);
    }

    if (channelFilter !== 'all') {
      result = result.filter((c) => (c.channel || 'whatsapp') === channelFilter);
    }

    if (readFilter === 'unread') {
      result = result.filter((c) => c.id !== activeConversationId && c.unread_count > 0);
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
  }, [conversations, filter, channelFilter, readFilter, search, activeConversationId]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleSelect = useCallback(
    (conv: Conversation) => {
      // Clear unread count locally when user opens this conversation
      conv.unread_count = 0;
      onSelect(conv);
    },
    [onSelect]
  );

  const activeFilter = FILTER_OPTIONS.find((o) => o.value === filter);

  return (
    <div className="flex h-full w-full flex-col border-r border-slate-200/80 bg-white lg:w-80 select-none">
      {/* ── Top Header matching reference image ───────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-white space-y-3">
        {/* Title + All/Unread Toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Chats</h1>
          <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setReadFilter('all')}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                readFilter === 'all'
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              All
            </button>
            <button
              onClick={() => setReadFilter('unread')}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                readFilter === 'unread'
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search chats..."
            className="h-9 border-0 bg-slate-100/80 pl-9 text-xs text-slate-900 placeholder-slate-400 rounded-xl focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:bg-white transition-all"
          />
        </div>

        {/* Channel Filter Pills (Instagram, WhatsApp, All) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setChannelFilter('instagram')}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 border",
              channelFilter === 'instagram'
                ? "text-white border-transparent shadow-sm"
                : "bg-slate-100/90 text-slate-700 border-slate-200/60 hover:bg-slate-200/80"
            )}
            style={channelFilter === 'instagram' ? { background: COLORS.instagram_gradient } : undefined}
          >
            <InstagramIcon className={cn("h-3.5 w-3.5", channelFilter === 'instagram' ? "text-white" : "")} style={channelFilter !== 'instagram' ? { color: COLORS.instagram } : undefined} />
            <span>Instagram</span>
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </button>

          <button
            onClick={() => setChannelFilter('whatsapp')}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 border",
              channelFilter === 'whatsapp'
                ? "text-white border-transparent shadow-sm"
                : "bg-slate-100/90 text-slate-700 border-slate-200/60 hover:bg-slate-200/80"
            )}
            style={channelFilter === 'whatsapp' ? { backgroundColor: COLORS.whatsapp } : undefined}
          >
            <WhatsAppIcon className={cn("h-3.5 w-3.5", channelFilter === 'whatsapp' ? "text-white" : "")} style={channelFilter !== 'whatsapp' ? { color: COLORS.whatsapp } : undefined} />
            <span>WhatsApp</span>
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </button>

          {channelFilter !== 'all' && (
            <button
              onClick={() => setChannelFilter('all')}
              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 shrink-0 transition-colors"
            >
              Reset
            </button>
          )}

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-full bg-slate-100 hover:bg-slate-200 ml-auto shrink-0 transition-colors">
              {activeFilter?.label ?? "Status"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-slate-200 bg-white shadow-lg rounded-xl min-w-[120px]">
              {FILTER_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={cn(
                    "text-xs font-medium cursor-pointer rounded-lg text-slate-700 hover:bg-slate-100",
                    filter === opt.value && "font-bold text-slate-900 bg-slate-100"
                  )}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Conversation List Items ───────────────────────────────────────── */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-slate-400">No chats found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/70">
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

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = parseSafeDate(dateStr);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const mins = differenceInMinutes(now, d);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min`;

  const hours = differenceInHours(now, d);
  if (hours < 24 && isToday(d)) return `${hours} h`;
  if (isYesterday(d)) return "Yesterday";

  return format(d, "MMM d");
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: ConversationItemProps) {
  const contact = conversation.contact;
  const displayName = contact?.name || contact?.phone || contact?.phone_number || "Unknown";
  const initials = displayName.charAt(0).toUpperCase();

  const isUnread = !isActive && conversation.unread_count > 0;
  const isInstagram = conversation.channel === 'instagram';

  const handleClick = useCallback(() => {
    onSelect(conversation);
  }, [onSelect, conversation]);

  const timeAgo = formatRelativeTime(conversation.last_message_at);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-all relative group",
        isActive
          ? "bg-slate-100/90 font-medium"
          : "hover:bg-slate-50/80 bg-white"
      )}
    >
      {/* Blue Unread Dot on the far left (reference image style) */}
      <div className="w-2.5 flex items-center justify-center shrink-0">
        {isUnread && (
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm" />
        )}
      </div>

      {/* Avatar */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white shadow-sm">
        {contact?.avatar_url ? (
          <img
            src={contact.avatar_url}
            alt={displayName}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1.5">
          <span className={cn("truncate text-sm text-slate-900", isUnread ? "font-bold" : "font-semibold")}>
            {displayName}
          </span>
          <span className="shrink-0 text-xs font-medium text-slate-400">
            {timeAgo}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className={cn("truncate text-xs text-slate-500 font-normal leading-tight", isUnread && "font-semibold text-slate-800")}>
            {formatLastMessageText(conversation.last_message_text)}
          </p>

          {/* Right Channel Icon + Chevron (reference image style) */}
          <div className="flex items-center shrink-0 ml-1">
            {isInstagram ? (
              <InstagramIcon className="h-4 w-4" style={{ color: COLORS.instagram }} />
            ) : (
              <WhatsAppIcon className="h-4 w-4" style={{ color: COLORS.whatsapp }} />
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all ml-0.5" />
          </div>
        </div>
      </div>
    </button>
  );
}
