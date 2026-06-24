"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { cn, createClient, parseSafeDate } from "../lib/utils";
import { api } from "@/core/api/axios";
import type {
  Conversation,
  Message,
  MessageReaction,
  Contact,
  ConversationStatus,
  Profile,
} from "../types";
import {
  MessageSquare,
  ChevronDown,
  UserPlus,
  Check,
  Clock,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { format, isToday, isYesterday, differenceInHours } from "date-fns";
import { isAxiosError } from "axios";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { MessageBubble } from "./message-bubble";
import { MessageActions } from "./message-actions";
import { MessageComposer, type SendMediaPayload } from "./message-composer";
import { TemplatePicker } from "./template-picker";
import { buildReplyPreview } from "./reply-quote";
import { toast } from "sonner";

interface ReplyDraft {
  id: string;
  authorLabel: string;
  preview: string;
}


interface MessageThreadProps {
  conversation: Conversation | null;
  contact: Contact | null;
  messages: Message[];
  onMessagesLoaded: (messages: Message[]) => void;
  onNewMessage: (message: Message) => void;
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
  onStatusChange: (conversationId: string, status: ConversationStatus) => void;
  onAssignChange: (
    conversationId: string,
    assignedAgentId: string | null,
  ) => void;
  /**
   * On mobile, the thread is shown full-screen with the conversation list
   * hidden. This callback lets the page deselect the active conversation
   * and reveal the list again. Rendered as a back-arrow in the header on
   * mobile only.
   */
  onBack?: () => void;
  /**
   * Increment to force the messages + reactions fetch effects to refire.
   * Parent bumps this on realtime reconnect / tab visibility → visible
   * so the open thread catches up on any events sent while the WS was
   * disconnected or the tab was throttled. Optional so existing callers
   * keep working.
   */
  resyncToken?: number;
  /**
   * Fired by the manual-refresh button in the thread header. The parent
   * typically bumps the same `resyncToken` it controls — this gives the
   * user a way to force a refetch when they suspect realtime missed an
   * event (or they're impatient). Optional so existing callers keep
   * working; the button is only rendered when this is provided.
   */
  onRefresh?: () => void;
}

function formatDateSeparator(dateStr: string): string {
  const date = parseSafeDate(dateStr);
  if (isNaN(date.getTime())) return "Unknown Date";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  for (const msg of messages) {
    let day = "unknown";
    if (msg.created_at) {
      const d = parseSafeDate(msg.created_at);
      if (!isNaN(d.getTime())) {
        day = format(d, "yyyy-MM-dd");
      }
    }
    
    if (day !== currentDate) {
      currentDate = day;
      groups.push({ date: msg.created_at || new Date().toISOString(), messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

const STATUS_OPTIONS: { label: string; value: ConversationStatus; color: string }[] = [
  { label: "Open", value: "open", color: "text-[#1E56A0]" },
  { label: "Pending", value: "pending", color: "text-amber-500" },
  { label: "Closed", value: "closed", color: "text-slate-500" },
];

/**
 * WhatsApp-style doodle background applied to the chat area (both the
 * active thread and the empty state). The SVG tile lives at
 * `/public/inbox-doodle.svg`; the warm light `#efeae2` color sits underneath so
 * the doodles read as a subtle pattern rather than a dark grid.
 */
const DOODLE_BG_CLASSES =
  "bg-[#efeae2] bg-[url('/inbox-doodle.svg')] bg-repeat";

import { useAuthContext } from "@/modules/auth/stores/AuthContext";

export function MessageThread({
  conversation,
  contact,
  messages,
  onMessagesLoaded,
  onNewMessage,
  onUpdateMessage,
  onStatusChange,
  onAssignChange,
  onBack,
  resyncToken = 0,
  onRefresh,
}: MessageThreadProps) {
  const { user } = useAuthContext();
  // loading is driven by the parent: true while messages array is empty
  // (the parent sets messages=[] when switching conversations then fills
  // it after the API call). We do NOT fetch from Supabase here — messages
  // live in MySQL and are polled by the parent page.
  const loading = messages.length === 0 && !!conversationId;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);

  // Reactions extracted dynamically from messages (reaction type or starting with [reaction]:)
  const parsedReactions = useMemo(() => {
    const map = new Map<string, MessageReaction>();

    messages.forEach((m) => {
      if (m.message_type === "reaction" || (m.content_text && m.content_text.startsWith("[reaction]:"))) {
        const text = m.content_text || "";
        const parts = text.split(":");
        if (parts.length >= 3) {
          const targetMessageId = parts[1];
          const emoji = parts[2];
          const actorId = m.direction === "outbound" ? "agent" : "customer";
          const key = `${targetMessageId}-${actorId}`;
          
          if (!emoji) {
            map.delete(key);
          } else {
            map.set(key, {
              id: m.id,
              message_id: targetMessageId,
              emoji: emoji,
              user_id: actorId,
              actor_type: m.direction === "outbound" ? "agent" : "customer",
              actor_id: actorId,
              conversation_id: m.conversation_id,
            });
          }
        }
      }
    });

    return Array.from(map.values());
  }, [messages]);

  useEffect(() => {
    setReactions(parsedReactions);
  }, [parsedReactions]);

  const visibleMessages = useMemo(() => {
    return messages.filter(
      (m) => m.message_type !== "reaction" && !(m.content_text && m.content_text.startsWith("[reaction]:"))
    );
  }, [messages]);

  /** Text to pre-fill the composer with after a template is selected. */
  const [prefillText, setPrefillText] = useState("");
  // Purely visual spin state for the manual-refresh button. The actual
  // refetch is fire-and-forget through `onRefresh` (which bumps the
  // parent's resyncToken); the 700ms spin is just feedback so the click
  // doesn't feel like a no-op. Cleared via the timer ref on unmount.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current !== null) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);
  const handleRefreshClick = useCallback(() => {
    if (isRefreshing || !onRefresh) return;
    setIsRefreshing(true);
    onRefresh();
    refreshTimerRef.current = setTimeout(() => {
      setIsRefreshing(false);
      refreshTimerRef.current = null;
    }, 700);
  }, [isRefreshing, onRefresh]);
  const [replyTo, setReplyTo] = useState<ReplyDraft | null>(null);

  // Profiles are bounded by RLS to rows the current user is allowed to
  // see — today that's just the current user, but the dropdown keeps the
  // shape ready for shared-team workspaces without a refactor.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const fetchProfiles = async () => {
      const { data, error }: Record<string, unknown> = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      if (cancelled) return;
      if (error) {
        console.error("Failed to fetch profiles");
        return;
      }
      setProfiles((data as Profile[]) ?? []);
    };
    fetchProfiles();
    return () => {
      cancelled = true;
    };
  }, []);

  // 24-hour session timer
  const sessionInfo = useMemo(() => {
    if (!messages.length) return { expired: false, remaining: "" };

    // Find last customer message
    const lastCustomerMsg = [...messages]
      .reverse()
      .find((m) => m.sender_type === "customer");

    if (!lastCustomerMsg) return { expired: true, remaining: "No customer messages" };

    const hoursSince = differenceInHours(new Date(), parseSafeDate(lastCustomerMsg.created_at));
    const expired = hoursSince >= 24;

    if (expired) {
      return { expired: true, remaining: "Expired" };
    }

    const hoursLeft = 24 - hoursSince;
    const remaining =
      hoursLeft >= 1
        ? `${Math.floor(hoursLeft)}h remaining`
        : `${Math.floor(hoursLeft * 60)}m remaining`;

    return { expired, remaining };
  }, [messages]);

  const conversationId = conversation?.id;

  // Clear any in-progress reply draft when the active conversation changes —
  // a quote pulled from conversation A shouldn't bleed into conversation B.
  useEffect(() => {
    setReplyTo(null);
  }, [conversationId]);


  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(
    async (text: string, replyToId?: string) => {
      if (!conversation) return;

      const tempId = `temp-${Date.now()}`;

      // Optimistic update — shows the message immediately with "sending" status
      const optimisticMsg: Message = {
        id: tempId,
        conversation_id: conversation.id,
        sender_type: "agent",
        content_type: "text",
        content_text: text,
        status: "sending",
        created_at: new Date().toISOString(),
        reply_to_message_id: replyToId,
        direction: "outbound",
        message_type: "text",
      };
      onNewMessage(optimisticMsg);
      setReplyTo(null);

      try {
        // ANAD backend expects { waId, message_type, content_text }.
        // conversation.id is the waId (phone number) — set in inbox/page.tsx.
        const res = await api.post("/whatsapp/send", {
          waId: conversation.id,
          message_type: "text",
          content_text: text,
          reply_to_message_id: replyToId,
        });
        const messageId = res.data?.data?.messageId;
        onUpdateMessage(tempId, {
          id: messageId || tempId,
          status: "sent",
        });
      } catch (err: unknown) {
        console.error("Failed to send message:", err);
        let reason = "network error";
        if (isAxiosError(err) && err.response?.data?.error) {
          reason = err.response.data.error;
        } else if (err instanceof Error) {
          reason = err.message;
        }
        toast.error(`Failed to send: ${reason}`);
        onUpdateMessage(tempId, { status: "failed", errorMessage: reason });
      }
    },
    [conversation, onNewMessage, onUpdateMessage]
  );

  const handleSendMedia = useCallback(
    async (payload: SendMediaPayload, replyToId?: string) => {
      if (!conversation) return;

      const tempId = `temp-${Date.now()}`;
      const label =
        payload.message_type === "image"
          ? "[Image]"
          : payload.message_type === "audio"
          ? "[Voice Note]"
          : `[Document]`;

      const optimisticMsg: Message = {
        id: tempId,
        conversation_id: conversation.id,
        sender_type: "agent",
        content_type: payload.message_type,
        content_text: payload.caption || label,
        status: "sending",
        created_at: new Date().toISOString(),
        reply_to_message_id: replyToId,
        direction: "outbound",
        message_type: payload.message_type,
        media_url: `/api/whatsapp/media/${payload.media_id}`,
      };
      onNewMessage(optimisticMsg);
      setReplyTo(null);

      try {
        const res = await api.post("/whatsapp/send", {
          waId: conversation.id,
          message_type: payload.message_type,
          media_id: payload.media_id,
          caption: payload.caption,
          filename: payload.filename,
          reply_to_message_id: replyToId,
        });
        const messageId = res.data?.data?.messageId;
        onUpdateMessage(tempId, {
          id: messageId || tempId,
          status: "sent",
          media_url: `/api/whatsapp/media/${payload.media_id}`,
        });
      } catch (err: unknown) {
        console.error("Failed to send media:", err);
        let reason = "network error";
        if (isAxiosError(err) && err.response?.data?.error) {
          reason = err.response.data.error;
        } else if (err instanceof Error) {
          reason = err.message;
        }
        toast.error(`Failed to send: ${reason}`);
        onUpdateMessage(tempId, { status: "failed", errorMessage: reason });
      }
    },
    [conversation, onNewMessage, onUpdateMessage]
  );

  const handleStatusChange = useCallback(
    async (status: ConversationStatus) => {
      if (!conversation) return;

      const supabase = createClient();
      await supabase
        .from("conversations")
        .update({ status })
        .eq("id", conversation.id);

      onStatusChange(conversation.id, status);
    },
    [conversation, onStatusChange]
  );

  const handleOpenTemplates = useCallback(() => {
    setTemplateModalOpen(true);
  }, []);

  /**
   * Called by TemplatePicker when the agent selects a template.
   * ANAD templates are plain-text quick-reply snippets — we pre-fill the
   * composer so the agent can review/edit before sending (rather than
   * auto-sending, which could send the wrong text if something goes wrong).
   */
  const handleTemplateSelect = useCallback((text: string) => {
    setPrefillText(text);
    setTemplateModalOpen(false);
  }, []);

  // Build a quick id → Message map so reply quotes can be rendered without
  // an extra fetch — the thread already holds the full conversation.
  const messagesById = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

  // Bucket reactions by their target message_id for O(1) per-bubble lookup.
  const reactionsByMessageId = useMemo(() => {
    const map = new Map<string, MessageReaction[]>();
    for (const r of reactions) {
      const bucket = map.get(r.message_id);
      if (bucket) bucket.push(r);
      else map.set(r.message_id, [r]);
    }
    return map;
  }, [reactions]);

  const contactDisplayName = contact?.name || contact?.phone || "Customer";

  // Author label for a quoted message: "You" when we sent the parent,
  // contact name when the customer sent it.
  const authorLabelFor = useCallback(
    (m: Message): string => {
      const isAgentMsg =
        m.sender_type === "agent" || m.sender_type === "bot";
      return isAgentMsg ? "You" : contactDisplayName;
    },
    [contactDisplayName],
  );

  const handleStartReply = useCallback(
    (msg: Message) => {
      setReplyTo({
        id: msg.id,
        authorLabel: authorLabelFor(msg),
        preview: buildReplyPreview(msg),
      });
    },
    [authorLabelFor],
  );

  // Single reaction-set primitive. emoji === "" removes; otherwise adds/swaps.
  // The "toggle" semantic (pill click) is computed at the call site where the
  // current reactions for the bubble are already in scope — keeps this
  // function dependency-free w.r.t. the reaction list.
  const postReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!user?.id || !conversation) {
        console.warn("[reactions] missing user or conversation");
        return;
      }
      if (messageId.startsWith("temp-")) {
        toast.error("Wait for the message to finish sending");
        return;
      }

      const convId = conversation.id;
      const userId = user.id;
      let snapshot: MessageReaction[] = [];

      // Functional updater — captures the freshest reactions list, never a
      // stale closure. Snapshot stored for rollback on POST failure.
      setReactions((prev) => {
        snapshot = prev;
        const own = prev.find(
          (r) =>
            r.message_id === messageId &&
            r.actor_type === "agent" &&
            r.actor_id === userId,
        );
        if (emoji === "") return own ? prev.filter((r) => r !== own) : prev;
        if (own) return prev.map((r) => (r === own ? { ...own, emoji } : r));
        return [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            message_id: messageId,
            conversation_id: convId,
            user_id: userId,
            actor_type: "agent",
            actor_id: userId,
            emoji,
            created_at: new Date().toISOString(),
          },
        ];
      });

      try {
        // Use api (which auto-attaches the accesstoken header) instead of raw fetch
        await api.post("/whatsapp/react", {
          message_id: messageId,
          emoji,
          waId: conversation.id,
        });
      } catch (err) {
        const reason = err instanceof Error ? err.message : "network error";
        toast.error(`Reaction failed: ${reason}`);
        setReactions(snapshot);
      }
    },
    [conversation, user?.id],
  );

  const handleAssignChange = useCallback(
    async (agentId: string | null) => {
      if (!conversation) return;

      const supabase = createClient();
      const { error } = await supabase
        .from("conversations")
        .update({ assigned_agent_id: agentId })
        .eq("id", conversation.id);

      if (error) {
        console.error("Failed to update assignment:", error);
        toast.error("Failed to update assignment");
        return;
      }

      onAssignChange(conversation.id, agentId);
    },
    [conversation, onAssignChange],
  );

  // Empty state — same WhatsApp-style doodle background as the active
  // thread below, so swapping between empty/selected doesn't change the
  // pattern under the user's eye.
  if (!conversation || !contact) {
    return (
      <div className={cn("flex flex-1 flex-col items-center justify-center", DOODLE_BG_CLASSES)}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D6E4F0] text-[#1E56A0] shadow-sm">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-[#0D1B3E]">
          Select a conversation
        </h3>
        <p className="mt-1 text-xs text-[#5A7190]">
          Choose a conversation from the left to start messaging
        </p>
      </div>
    );
  }

  const displayName = contact.name || contact.phone || "Customer";
  const messageGroups = groupMessagesByDate(visibleMessages);
  const currentStatus = STATUS_OPTIONS.find(
    (s) => s.value === conversation.status
  );
  const assignedAgentId = conversation.assigned_agent_id ?? null;
  const currentAssignee = profiles.find((p) => p.user_id === assignedAgentId);
  const assignLabel = assignedAgentId
    ? (currentAssignee?.full_name ?? "Assigned")
    : "Assign";

  return (
    <div className={cn("flex flex-1 flex-col", DOODLE_BG_CLASSES)}>
      {/* Header — light bg-[#F6F6F6] sits on top of the doodle so the
          name/avatar/dropdowns stay legible. */}
      <div className="flex items-center justify-between gap-2 border-b border-[#D6E4F0] bg-[#F6F6F6] px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Back-to-list button — mobile only. Hidden on lg+ where the
              conversation list is always visible next to the thread. */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-[#5A7190] hover:bg-[#EEF4FB] hover:text-[#0D1B3E] lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1E56A0] text-sm font-medium text-white shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[#0D1B3E]">{displayName}</h2>
            <p className="truncate text-xs text-[#5A7190]">{contact.phone}</p>
          </div>
          {/* Session timer badge — hidden on the narrowest phones so
              the name + back arrow keep their room. */}
          <Badge
            variant="outline"
            className={cn(
              "ml-1 hidden gap-1 border-[#D6E4F0] text-[10px] sm:inline-flex sm:ml-2 bg-[#EEF4FB]",
              sessionInfo.expired ? "text-red-500" : "text-[#1E56A0]"
            )}
          >
            <Clock className="h-3 w-3" />
            {sessionInfo.remaining}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Manual refresh — forces a refetch of the messages + the
              conversation list (the parent bumps its resyncToken). Useful
              when realtime missed an event or the agent just wants to be
              sure nothing's stale. Only rendered when the parent wires
              up `onRefresh`. */}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              aria-label="Refresh conversation"
              title="Refresh"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-md text-[#5A7190] transition-colors hover:bg-[#EEF4FB] hover:text-[#0D1B3E] disabled:opacity-60",
              )}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
              />
            </button>
          )}

          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
                  "inline-flex items-center justify-center h-7 gap-1 px-2 text-xs rounded-md hover:bg-[#EEF4FB] border border-[#D6E4F0]",
                  currentStatus?.color ?? "text-[#5A7190]"
                )}>
                {currentStatus?.label ?? "Status"}
                <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-[#D6E4F0] bg-white shadow-lg"
            >
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={cn("text-sm text-[#0D1B3E] hover:bg-[#EEF4FB] rounded-sm")}
                >
                  <span className={opt.color}>{opt.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assign dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center h-7 gap-1 px-2 text-xs rounded-md hover:bg-[#EEF4FB] border border-[#D6E4F0]",
                assignedAgentId ? "text-[#1E56A0] bg-[#EEF4FB]" : "text-[#5A7190]"
              )}
            >
              <UserPlus className="h-3 w-3" />
              <span className="hidden sm:inline">{assignLabel}</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-[#D6E4F0] bg-white shadow-lg"
            >
              {profiles.length === 0 ? (
                <DropdownMenuItem disabled className="text-sm text-[#5A7190]">
                  No teammates available
                </DropdownMenuItem>
              ) : (
                profiles.map((p) => {
                  const isSelected = p.user_id === assignedAgentId;
                  return (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => handleAssignChange(p.user_id ?? null)}
                      className={cn(
                        "text-sm hover:bg-[#EEF4FB] rounded-sm",
                        isSelected ? "text-[#1E56A0] font-semibold" : "text-[#0D1B3E]"
                      )}
                    >
                      <span className="flex-1">
                        {p.full_name}
                        {p.user_id === user?.id ? " (me)" : ""}
                      </span>
                      {isSelected && <Check className="ml-2 h-3 w-3 text-[#1E56A0]" />}
                    </DropdownMenuItem>
                  );
                })
              )}
              {assignedAgentId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleAssignChange(null)}
                    className="text-sm text-red-500 hover:bg-red-50 rounded-sm"
                  >
                    Unassign
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-transparent">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1E56A0] border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-[#5A7190] font-medium">No messages yet</p>
            <p className="text-xs text-[#5A7190]/80">
              Send a template to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messageGroups.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="mb-4 flex items-center justify-center">
                  <span className="rounded-full bg-white/90 shadow-sm border border-[#D6E4F0]/70 px-3 py-1 text-[10px] font-semibold text-[#5A7190]">
                    {formatDateSeparator(group.date)}
                  </span>
                </div>
                {/* Messages */}
                <div className="space-y-2">
                  {group.messages.map((msg) => {
                    const parent = msg.reply_to_message_id
                      ? messagesById.get(msg.reply_to_message_id)
                      : null;
                    const reply = parent
                      ? {
                          authorLabel: authorLabelFor(parent),
                          preview: buildReplyPreview(parent),
                        }
                      : null;
                    const msgReactions = reactionsByMessageId.get(msg.id);
                    // Toggle is computed at the call site — `msgReactions`
                    // and `user?.id` are already in scope, no extra hook.
                    const handlePillToggle = (emoji: string) => {
                      const own = msgReactions?.find(
                        (r) =>
                          r.actor_type === "agent" &&
                          r.actor_id === user?.id,
                      );
                      const next = own?.emoji === emoji ? "" : emoji;
                      void postReaction(msg.id, next);
                    };
                    return (
                      <MessageActions
                        key={msg.id}
                        message={msg}
                        onReply={() => handleStartReply(msg)}
                        onReact={(emoji) => {
                          if (emoji) void postReaction(msg.id, emoji);
                        }}
                      >
                        <MessageBubble
                          message={msg}
                          reply={reply}
                          reactions={msgReactions}
                          currentUserId={user?.id}
                          onToggleReaction={handlePillToggle}
                        />
                      </MessageActions>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <MessageComposer
        conversationId={conversation.id}
        sessionExpired={sessionInfo.expired}
        onSend={handleSend}
        onSendMedia={handleSendMedia}
        onOpenTemplates={handleOpenTemplates}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        prefillText={prefillText}
        onPrefillConsumed={() => setPrefillText("")}
      />

      <TemplatePicker
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
