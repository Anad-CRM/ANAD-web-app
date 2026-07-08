"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/core/api/axios';
import type { Message, Conversation, Contact } from '@/modules/inbox/types';
import { MessageThread } from '@/modules/inbox/components/message-thread';

interface Props {
  leadId: string;
  waId?: string; // hint from lead.mobileNumber, not used for fetching
  leadName?: string;
}

/** Maps the raw backend whatsapp row to the shared inbox Message type */
function mapToMessage(m: Record<string, unknown>, conversationWaId: string): Message {
  const direction = m.direction === 'outbound' ? 'outbound' : 'inbound';
  const rawType = (m.messageType as string) || 'text';
  const typeMap: Record<string, Message['message_type']> = {
    text: 'text', image: 'image', audio: 'audio', voice: 'audio',
    video: 'video', document: 'document', template: 'template',
    sticker: 'sticker', reaction: 'reaction',
  };

  // Backend stores timestamp as unix epoch seconds — convert to ISO
  const ts = m.timestamp as string;
  const num = Number(ts);
  const created_at =
    !isNaN(num) && num > 1_000_000_000
      ? new Date(num * 1000).toISOString()
      : ts ?? new Date().toISOString();

  const mediaRaw = m.mediaUrl as string | undefined;
  let media_url: string | undefined;
  if (mediaRaw) {
    // Proxy internal paths through the frontend API route
    media_url = mediaRaw.startsWith('/whatsapp/media/')
      ? `/api${mediaRaw}`
      : mediaRaw;
  }

  return {
    id: (m.id as string) ?? `msg-${Date.now()}-${Math.random()}`,
    conversation_id: conversationWaId,
    content_text: (m.message as string) ?? null,
    content_type: typeMap[rawType] ?? 'text',
    sender_type: direction === 'outbound' ? 'agent' : 'customer',
    direction,
    status: (m.status as Message['status']) ?? 'delivered',
    message_type: typeMap[rawType] ?? 'text',
    created_at,
    media_url,
    reply_to_message_id: (m.replyToMessageId as string) || undefined,
    wamid: (m.messageId as string) || undefined,
    name: (m.name as string) || undefined,
    errorMessage: (m.errorMessage as string) || undefined,
  };
}

export const WhatsAppMessagesCard: React.FC<Props> = ({ leadId, leadName }) => {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  // waId discovered from the server response (guaranteed to match DB)
  const [resolvedWaId, setResolvedWaId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMessages = useCallback(async (limit = 30, offset = 0) => {
    if (!leadId) return;
    if (offset === 0) setLoading(true);
    try {
      const { data } = await api.get(`/whatsapp/messages-by-lead/${leadId}`, {
        params: { limit, offset }
      });
      if (data.success && Array.isArray(data.data)) {
        const waId: string = data.waId ?? '';
        setResolvedWaId(waId || null);

        const mapped = (data.data as Record<string, unknown>[])
          .filter(
            (m) =>
              m.messageType !== 'reaction' &&
              !(m.message as string)?.startsWith('[reaction]:')
          )
          .map((m) => mapToMessage(m, waId));

        if (offset === 0) {
          setMessages((prev) => {
            if (prev.length === 0) return mapped;
            const merged = [...prev];
            mapped.forEach((newMsg) => {
              const idx = merged.findIndex((m) => m.id === newMsg.id);
              if (idx !== -1) {
                merged[idx] = newMsg;
              } else {
                merged.push(newMsg);
              }
            });
            return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        } else {
          if (mapped.length < limit) {
            setHasMore(false);
          }
          setMessages((prev) => {
            const merged = [...mapped];
            prev.forEach((existingMsg) => {
              if (!merged.some((m) => m.id === existingMsg.id)) {
                merged.push(existingMsg);
              }
            });
            return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        }
      }
    } catch {
      // silent — user can refresh manually
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchMessages(30, 0);
    const interval = setInterval(() => fetchMessages(30, 0), 10_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchMessages(30, messages.length);
    setLoadingMore(false);
  }, [loadingMore, hasMore, messages.length, fetchMessages]);

  /** Called by MessageThread on optimistic send */
  const handleNewMessage = useCallback((msg: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  /** Called by MessageThread after server confirms send */
  const handleUpdateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, []);

  // Build minimal Conversation + Contact for MessageThread
  // Use resolvedWaId (exact DB value) so sending goes to the right number
  const waId = resolvedWaId ?? '';
  const conversation: Conversation | null = waId
    ? { id: waId, contact_id: waId, status: 'open', unread_count: 0, is_ai_enabled: false }
    : null;

  const contact: Contact | null = waId
    ? { id: waId, name: leadName || null, phone_number: waId, phone: waId }
    : null;

  return (
    <MessageThread
      embedded
      conversation={conversation}
      contact={contact}
      messages={loading && messages.length === 0 ? [] : messages}
      onMessagesLoaded={() => {}}
      onNewMessage={handleNewMessage}
      onUpdateMessage={handleUpdateMessage}
      onStatusChange={() => {}}
      onAssignChange={() => {}}
      onRefresh={fetchMessages}
      onOpenInInbox={waId ? () => router.push(`/inbox?c=${waId}`) : undefined}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
    />
  );
};
