"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { cn, createClient, parseSafeDate } from "../lib/utils";
import { api } from "@/core/api/axios";
import { getToken } from "@/core/utils/auth";
import { Whatsapp as WhatsappIcon } from "@thesvg/react";

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
  Bot,
  Loader2,
  Sparkles,
  Phone,
} from "lucide-react";
import { format, isToday, isYesterday, differenceInHours } from "date-fns";
import { isAxiosError } from "axios";
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
  onBack?: () => void;
  resyncToken?: number;
  onRefresh?: () => void;
  onAiToggle?: (conversationId: string, isAiEnabled: boolean) => void;
  /** When true renders as a compact embedded card (lead details) — no Supabase controls */
  embedded?: boolean;
  /** Called when user clicks "Open in Inbox" in embedded mode */
  onOpenInInbox?: () => void;
  /** Callback to fetch more older messages when scrolling to the top */
  onLoadMore?: () => Promise<void>;
  /** Whether there are more older messages available to load */
  hasMore?: boolean;
  /** Whether a load-more API request is currently in progress */
  loadingMore?: boolean;
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

const STATUS_OPTIONS: { label: string; value: ConversationStatus; color: string; dot: string }[] = [
  { label: "Open", value: "open", color: "text-blue-600", dot: "bg-blue-500" },
  { label: "Pending", value: "pending", color: "text-amber-500", dot: "bg-amber-400" },
  { label: "Closed", value: "closed", color: "text-slate-400", dot: "bg-slate-400" },
];

/** Subtle warm WhatsApp-ish background */
const CHAT_BG = "bg-slate-50 bg-[url('/inbox-doodle.svg')] bg-repeat";

import { useAuthContext } from "@/modules/auth/stores/AuthContext";

/* ─── Avatar Helper ───────────────────────────────────────────────────────── */
function AvatarCircle({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-md",
        "bg-gradient-to-br from-[#1E56A0] to-[#2563EB]",
        sizeClasses
      )}
    >
      {initials || "?"}
    </div>
  );
}

export function MessageThread({
  conversation,
  contact,
  messages,
  onMessagesLoaded: _onMessagesLoaded,
  onNewMessage,
  onUpdateMessage,
  onStatusChange,
  onAssignChange,
  onBack,
  resyncToken: _resyncToken = 0,
  onRefresh,
  onAiToggle,
  embedded = false,
  onOpenInInbox,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: MessageThreadProps) {
  const { user } = useAuthContext();
  const [togglingAi, setTogglingAi] = useState(false);

  const isAiEnabled = conversation?.is_ai_enabled === true;

  const handleAiToggleClick = async () => {
    if (!conversation) return;
    setTogglingAi(true);
    const nextVal = !isAiEnabled;
    try {
      await api.post("/whatsapp/toggle-ai", {
        waId: conversation.id,
        isAiEnabled: nextVal,
      });
      if (onAiToggle) {
        onAiToggle(conversation.id, nextVal);
      }
      toast.success(`AI Auto Responder ${nextVal ? "enabled" : "disabled"} for this chat`);
    } catch {
      toast.error("Failed to toggle AI responder");
    } finally {
      setTogglingAi(false);
    }
  };

  const loading = messages.length === 0 && !!conversation?.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);

  const parsedReactions = useMemo(() => {
    const wamidToId = new Map<string, string>();
    messages.forEach((m) => {
      if (m.wamid) wamidToId.set(m.wamid, m.id);
    });

    const map = new Map<string, MessageReaction>();

    messages.forEach((m) => {
      if (m.message_type === "reaction" || (m.content_text && m.content_text.startsWith("[reaction]:"))) {
        const text = m.content_text || "";
        const firstColon = text.indexOf(":");
        const secondColon = text.indexOf(":", firstColon + 1);
        if (firstColon === -1 || secondColon === -1) return;

        const targetWamid = text.substring(firstColon + 1, secondColon);
        const emoji = text.substring(secondColon + 1);

        const targetInternalId = wamidToId.get(targetWamid) ?? targetWamid;
        const actorId = m.direction === "outbound" ? "agent" : "customer";
        const key = `${targetInternalId}-${actorId}`;

        if (!emoji || !targetWamid) {
          map.delete(key);
        } else {
          map.set(key, {
            id: m.id,
            message_id: targetInternalId,
            emoji: emoji,
            user_id: actorId,
            actor_type: m.direction === "outbound" ? "agent" : "customer",
            actor_id: actorId,
            conversation_id: m.conversation_id,
          });
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
      (m) =>
        m.message_type !== "reaction" &&
        !(m.content_text && m.content_text.startsWith("[reaction]:"))
    );
  }, [messages]);

  const [prefillText, setPrefillText] = useState("");
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

  const sessionInfo = useMemo(() => {
    if (!messages.length) return { expired: false, remaining: "" };

    const lastCustomerMsg = [...messages]
      .reverse()
      .find((m) => m.sender_type === "customer");

    if (!lastCustomerMsg) return { expired: true, remaining: "No customer messages" };

    const hoursSince = differenceInHours(new Date(), parseSafeDate(lastCustomerMsg.created_at));
    const expired = hoursSince >= 24;

    if (expired) {
      return { expired: true, remaining: "Session expired" };
    }

    const hoursLeft = 24 - hoursSince;
    const remaining =
      hoursLeft >= 1
        ? `${Math.floor(hoursLeft)}h left`
        : `${Math.floor(hoursLeft * 60)}m left`;

    return { expired, remaining };
  }, [messages]);

  const conversationId = conversation?.id;

  const prevFirstMessageIdRef = useRef<string | undefined>(undefined);
  const prevLastMessageIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const firstMsg = messages[0];
    const lastMsg = messages[messages.length - 1];

    // Case 1: Initial load or conversation change (prevFirstMessageIdRef is undefined)
    if (prevFirstMessageIdRef.current === undefined && firstMsg) {
      el.scrollTop = el.scrollHeight;
    }
    // Case 2: New message appended at bottom (sent/received)
    else if (lastMsg && lastMsg.id !== prevLastMessageIdRef.current) {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
      if (isNearBottom || lastMsg.direction === "outbound") {
        el.scrollTop = el.scrollHeight;
      }
    }

    prevFirstMessageIdRef.current = firstMsg?.id;
    prevLastMessageIdRef.current = lastMsg?.id;
  }, [messages]);

  useEffect(() => {
    prevFirstMessageIdRef.current = undefined;
    prevLastMessageIdRef.current = undefined;
    setReplyTo(null);
  }, [conversationId]);

  const handleScroll = useCallback(
    async (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (el.scrollTop === 0 && hasMore && !loadingMore && onLoadMore) {
        const prevScrollHeight = el.scrollHeight;
        await onLoadMore();
        // Adjust the scroll position so it doesn't jump after prepend
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevScrollHeight;
        });
      }
    },
    [hasMore, loadingMore, onLoadMore]
  );

  /* ─── Send handlers ─────────────────────────────────────────────────── */
  const handleSend = useCallback(
    async (text: string, replyToId?: string) => {
      if (!conversation) return;

      const tempId = `temp-${Date.now()}`;
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
        let reason = "Failed to send message. Please try again.";
        let is24hError = false;

        if (isAxiosError(err) && err.response?.data) {
          const data = err.response.data;
          if (
            data.errorType === "24_hour_window" ||
            (data.error && (data.error.includes("24 hours") || data.error.includes("more than 24")))
          ) {
            is24hError = true;
            reason =
              "Message failed to send because more than 24 hours have passed since the customer last replied to this number.";
          } else if (data.error) {
            reason = data.error;
          }
        } else if (err instanceof Error) {
          reason = err.message;
        }

        toast.error(reason, { duration: is24hError ? 6000 : 4000 });
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
          : "[Document]";

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
        let reason = "Failed to send message. Please try again.";
        let is24hError = false;

        if (isAxiosError(err) && err.response?.data) {
          const data = err.response.data;
          if (
            data.errorType === "24_hour_window" ||
            (data.error && (data.error.includes("24 hours") || data.error.includes("more than 24")))
          ) {
            is24hError = true;
            reason =
              "Message failed to send because more than 24 hours have passed since the customer last replied to this number.";
          } else if (data.error) {
            reason = data.error;
          }
        } else if (err instanceof Error) {
          reason = err.message;
        }

        toast.error(reason, { duration: is24hError ? 6000 : 4000 });
        onUpdateMessage(tempId, { status: "failed", errorMessage: reason });
      }
    },
    [conversation, onNewMessage, onUpdateMessage]
  );

  const handleStatusChange = useCallback(
    async (status: ConversationStatus) => {
      if (!conversation) return;
      const supabase = createClient();
      await supabase.from("conversations").update({ status }).eq("id", conversation.id);
      onStatusChange(conversation.id, status);
    },
    [conversation, onStatusChange]
  );

  const handleOpenTemplates = useCallback(() => {
    setTemplateModalOpen(true);
  }, []);

  const handleTemplateSelect = useCallback((text: string) => {
    setPrefillText(text);
    setTemplateModalOpen(false);
  }, []);

  const messagesById = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

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

  const authorLabelFor = useCallback(
    (m: Message): string => {
      const isAgentMsg = m.sender_type === "agent" || m.sender_type === "bot";
      return isAgentMsg ? "You" : contactDisplayName;
    },
    [contactDisplayName]
  );

  const handleStartReply = useCallback(
    (msg: Message) => {
      setReplyTo({
        id: msg.id,
        authorLabel: authorLabelFor(msg),
        preview: buildReplyPreview(msg),
      });
    },
    [authorLabelFor]
  );

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

      setReactions((prev) => {
        snapshot = prev;
        const own = prev.find(
          (r) => r.message_id === messageId && r.actor_type === "agent" && r.actor_id === userId
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
        const token = getToken();
        if (!token) {
          console.error("[postReaction] No auth token in localStorage");
          throw new Error("Not authenticated");
        }
        const result = await api.post(
          "/whatsapp/react",
          { message_id: messageId, emoji, waId: conversation.id },
          { headers: { accesstoken: token } }
        );
        if (!result.data?.success) {
          throw new Error(result.data?.error || "Reaction failed");
        }
      } catch (err) {
        const reason = err instanceof Error ? err.message : "network error";
        toast.error(`Reaction failed: ${reason}`);
        setReactions(snapshot);
      }
    },
    [conversation, user?.id]
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
    [conversation, onAssignChange]
  );
  /* ─── Embedded card layout (lead details) ──────────────────────────── */
  if (embedded) {
    const messageGroups = groupMessagesByDate(visibleMessages);
    return (
      <div
        className="flex flex-col overflow-hidden rounded-[24px] sm:rounded-[32px] border border-black/5 shadow-sm bg-white"
        style={{ height: "520px" }}
      >
        {/* Compact embedded header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
              <WhatsappIcon width={18} height={18} className="text-[#4CAF50]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {contact ? contact.name || contact.phone || "WhatsApp Chat" : "WhatsApp Chat"}
              </p>
              {visibleMessages.length > 0 && (
                <p className="text-[10px] text-slate-400">{visibleMessages.length} messages</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onRefresh && (
              <button
                type="button"
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                title="Refresh"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              </button>
            )}
            {onOpenInInbox && (
              <button
                type="button"
                onClick={onOpenInInbox}
                title="Open in Inbox"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E56A0] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 -rotate-[135deg]" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn("flex-1 overflow-y-auto px-4 py-3", CHAT_BG)}
          style={{ scrollBehavior: "smooth" }}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1E56A0] border-t-transparent" />
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <WhatsappIcon width={32} height={32} className="text-slate-300" />
              <p className="text-sm text-slate-400">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {loadingMore && (
                <div className="flex items-center justify-center py-2 shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-450" />
                </div>
              )}
              {messageGroups.map((group) => (
                <div key={group.date}>
                  <div className="my-3 flex items-center justify-center">
                    <span className="rounded-full bg-white/80 px-3 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
                      {formatDateSeparator(group.date)}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {group.messages.map((msg) => {
                      const parent = msg.reply_to_message_id
                        ? messagesById.get(msg.reply_to_message_id)
                        : null;
                      const reply = parent
                        ? { authorLabel: authorLabelFor(parent), preview: buildReplyPreview(parent) }
                        : null;
                      const msgReactions = reactionsByMessageId.get(msg.id);
                      const handlePillToggle = (emoji: string) => {
                        const own = msgReactions?.find((r) => r.actor_type === "agent" && r.actor_id === user?.id);
                        void postReaction(msg.id, own?.emoji === emoji ? "" : emoji);
                      };
                      return (
                        <MessageActions
                          key={msg.id}
                          message={msg}
                          contact={contact}
                          onReply={() => handleStartReply(msg)}
                          onReact={(emoji) => { if (emoji) void postReaction(msg.id, emoji); }}
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
        <div className="border-t border-slate-100 bg-white shrink-0">
          <MessageComposer
            conversationId={conversation?.id ?? ""}
            sessionExpired={sessionInfo.expired}
            onSend={handleSend}
            onSendMedia={handleSendMedia}
            onOpenTemplates={handleOpenTemplates}
            replyTo={replyTo}
            onClearReply={() => setReplyTo(null)}
            prefillText={prefillText}
            onPrefillConsumed={() => setPrefillText("")}
          />
        </div>

        <TemplatePicker
          open={templateModalOpen}
          onOpenChange={setTemplateModalOpen}
          onSelect={handleTemplateSelect}
        />
      </div>
    );
  }

  /* ─── Empty state (full-page inbox only) ────────────────────────────── */
  if (!conversation || !contact) {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-4",
          CHAT_BG
        )}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <MessageSquare className="h-10 w-10 text-[#1E56A0]" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-slate-700">
            No conversation selected
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Pick a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  const displayName = contact.name || contact.phone || "Customer";
  const messageGroups = groupMessagesByDate(visibleMessages);
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === conversation.status);
  const assignedAgentId = conversation.assigned_agent_id ?? null;
  const currentAssignee = profiles.find((p) => p.user_id === assignedAgentId);
  const assignLabel = assignedAgentId ? (currentAssignee?.full_name ?? "Assigned") : "Assign";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3 shadow-sm">

        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile back */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          )}

          <AvatarCircle name={displayName} size="md" />

          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-semibold leading-tight text-slate-800">
              {displayName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Phone className="h-3 w-3 text-slate-400" />
              <p className="text-[11px] text-slate-400 font-medium">{contact.phone}</p>
            </div>
          </div>

          {/* Session timer */}
          {sessionInfo.remaining && (
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                sessionInfo.expired
                  ? "bg-red-50 text-red-500 ring-1 ring-red-200"
                  : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
              )}
            >
              <Clock className="h-3 w-3" />
              {sessionInfo.remaining}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">

          {/* Refresh */}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              aria-label="Refresh conversation"
              title="Refresh messages"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            </button>
          )}

          {/* AI toggle pill */}
          <button
            type="button"
            onClick={handleAiToggleClick}
            disabled={togglingAi}
            title={isAiEnabled ? "AI is ON — click to disable" : "AI is OFF — click to enable"}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition-all duration-200 border select-none",
              isAiEnabled
                ? "bg-violet-600 border-violet-600 text-white shadow-[0_0_12px_3px_rgba(124,58,237,0.30)] hover:bg-violet-700"
                : "bg-white border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600"
            )}
          >
            {togglingAi ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                {isAiEnabled
                  ? <Sparkles className="h-3.5 w-3.5 text-white" />
                  : <Bot className="h-3.5 w-3.5" />
                }
              </>
            )}
            <span className="hidden sm:inline">{isAiEnabled ? "AI On" : "AI"}</span>
            {/* Toggle track */}
            <span className={cn(
              "relative flex h-4 w-7 items-center rounded-full transition-colors duration-200 shrink-0",
              isAiEnabled ? "bg-white/30" : "bg-slate-200"
            )}>
              <span className={cn(
                "absolute h-3 w-3 rounded-full shadow transition-all duration-200",
                isAiEnabled ? "translate-x-3.5 bg-white" : "translate-x-0.5 bg-slate-400"
              )} />
            </span>
          </button>

          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center gap-1.5 h-8 px-2.5 text-[12px] font-medium rounded-lg border transition-colors hover:bg-slate-50",
                currentStatus
                  ? `${currentStatus.color} border-slate-200`
                  : "text-slate-500 border-slate-200"
              )}
            >
              {currentStatus && (
                <span className={cn("h-2 w-2 rounded-full", currentStatus.dot)} />
              )}
              {currentStatus?.label ?? "Status"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[130px] rounded-xl border-slate-200 bg-white shadow-xl">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <span className={cn("h-2 w-2 rounded-full", opt.dot)} />
                  <span className={opt.color}>{opt.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assign dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center gap-1.5 h-8 px-2.5 text-[12px] font-medium rounded-lg border transition-colors hover:bg-slate-50",
                assignedAgentId
                  ? "text-blue-600 bg-blue-50 border-blue-200"
                  : "text-slate-500 border-slate-200"
              )}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{assignLabel}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[170px] rounded-xl border-slate-200 bg-white shadow-xl">
              {profiles.length === 0 ? (
                <DropdownMenuItem disabled className="text-sm text-slate-400">
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
                        "text-sm rounded-lg cursor-pointer",
                        isSelected ? "text-blue-600 font-semibold bg-blue-50" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span className="flex-1">
                        {p.full_name}
                        {p.user_id === user?.id ? " (me)" : ""}
                      </span>
                      {isSelected && <Check className="ml-2 h-3.5 w-3.5 text-blue-600" />}
                    </DropdownMenuItem>
                  );
                })
              )}
              {assignedAgentId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleAssignChange(null)}
                    className="text-sm text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    Unassign
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Messages Area ───────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn("flex-1 overflow-y-auto px-4 py-5", CHAT_BG)}
        style={{ scrollBehavior: "smooth" }}
      >
        {loading ? (
          /* Loading skeleton */
          <div className="flex flex-col gap-4 pt-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  i % 2 === 0 ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "h-10 animate-pulse rounded-2xl bg-white/80",
                    i % 2 === 0 ? "w-48 rounded-tr-none" : "w-56 rounded-tl-none"
                  )}
                />
              </div>
            ))}
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading messages…
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
              <MessageSquare className="h-8 w-8 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">No messages yet</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Send a template message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {loadingMore && (
              <div className="flex items-center justify-center py-2 shrink-0">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            )}
            {messageGroups.map((group) => (
              <div key={group.date}>
                {/* ── Date separator ── */}
                <div className="my-4 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-12 bg-slate-300/60" />
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
                      {formatDateSeparator(group.date)}
                    </span>
                    <div className="h-px w-12 bg-slate-300/60" />
                  </div>
                </div>

                {/* ── Message bubbles ── */}
                <div className="space-y-1.5">
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

                    const handlePillToggle = (emoji: string) => {
                      const own = msgReactions?.find(
                        (r) => r.actor_type === "agent" && r.actor_id === user?.id
                      );
                      const next = own?.emoji === emoji ? "" : emoji;
                      void postReaction(msg.id, next);
                    };

                    return (
                      <MessageActions
                        key={msg.id}
                        message={msg}
                        contact={contact}
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

      {/* ── Composer ────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200 bg-white">
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
      </div>

      <TemplatePicker
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
