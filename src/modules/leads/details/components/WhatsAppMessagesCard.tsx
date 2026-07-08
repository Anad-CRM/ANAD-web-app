"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/core/api/axios';
import type { Message, Conversation, Contact } from '@/modules/inbox/types';
import { MessageThread } from '@/modules/inbox/components/message-thread';

interface Props {
  leadId: string;
  waId?: string;
}

/** Maps the raw backend message shape to the shared inbox Message type */
function mapToMessage(m: Record<string, unknown>, waId: string): Message {
  const direction = m.direction === 'outbound' ? 'outbound' : 'inbound';
  const rawType = (m.messageType as string) || 'text';
  const typeMap: Record<string, Message['message_type']> = {
    text: 'text', image: 'image', audio: 'audio', voice: 'audio',
    video: 'video', document: 'document', template: 'template',
    sticker: 'sticker', reaction: 'reaction',
  };

  // Backend stores timestamps as unix epoch seconds — convert to ISO
  const ts = m.timestamp as string;
  const num = Number(ts);
  const created_at =
    !isNaN(num) && num > 1_000_000_000
      ? new Date(num * 1000).toISOString()
      : (ts ?? new Date().toISOString());

  return {
    id: (m.id as string) ?? `msg-${Math.random()}`,
    conversation_id: waId,
    content_text: (m.message as string) ?? null,
    content_type: typeMap[rawType] ?? 'text',
    sender_type: direction === 'outbound' ? 'agent' : 'customer',
    direction,
    status: (m.status as Message['status']) ?? 'delivered',
    message_type: typeMap[rawType] ?? 'text',
    created_at,
    media_url: m.mediaUrl
      ? (m.mediaUrl as string).startsWith('/whatsapp/media/')
        ? `/api${m.mediaUrl as string}`
        : (m.mediaUrl as string)
      : undefined,
    reply_to_message_id: (m.replyToMessageId as string) || undefined,
    wamid: (m.messageId as string) || undefined,
    name: (m.name as string) || undefined,
    errorMessage: (m.errorMessage as string) || undefined,
  };
}

export const WhatsAppMessagesCard: React.FC<Props> = ({ leadId: _leadId, waId }) => {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Build minimal Conversation + Contact objects from waId
  const conversation: Conversation | null = waId
    ? { id: waId, contact_id: waId, status: 'open', unread_count: 0, is_ai_enabled: false }
    : null;

  const contact: Contact | null = waId
    ? { id: waId, name: null, phone_number: waId, phone: waId }
    : null;

  const fetchMessages = useCallback(async () => {
    if (!waId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/whatsapp/messages/${waId}`);
      if (data.success && Array.isArray(data.data)) {
        const mapped = (data.data as Record<string, unknown>[])
          .filter((m) => m.messageType !== 'reaction' && !(m.message as string)?.startsWith('[reaction]:'))
          .map((m) => mapToMessage(m, waId));
        setMessages(mapped);
      }
    } catch {
      // silent — user can refresh manually
    } finally {
      setLoading(false);
    }
  }, [waId]);

  useEffect(() => {
    fetchMessages();
    // Poll every 10 s while the card is mounted
    const interval = setInterval(fetchMessages, 10_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  /** Called by MessageThread when the user sends a new message */
  const handleNewMessage = useCallback((msg: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  /** Called by MessageThread after send confirms (update id / status) */
  const handleUpdateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, []);

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
    />
  );
};
