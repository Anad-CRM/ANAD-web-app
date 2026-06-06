"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Conversation, Message, Contact } from "@/modules/inbox/types";
import { ConversationList } from "@/modules/inbox/components/conversation-list";
import { MessageThread } from "@/modules/inbox/components/message-thread";
import { ContactSidebar } from "@/modules/inbox/components/contact-sidebar";
import { WifiOff } from "lucide-react";
import { cn } from "@/modules/inbox/lib/utils";
import { api } from "@/core/api/axios";

export default function InboxPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [whatsappConnected, setWhatsappConnected] = useState<boolean | null>(null);
  const [resyncToken, setResyncToken] = useState(0);

  const autoSelectedForDeepLinkRef = useRef<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data } = await api.get('/whatsapp/config');
        setWhatsappConnected(data.connected);
      } catch {
        setWhatsappConnected(false);
      }
    };
    checkConnection();
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/whatsapp/conversations');
      if (data.success) {
        setConversations(data.data.map((c: Record<string, unknown>) => ({
          id: c.waId as string,
          contact_id: c.waId as string,
          status: 'open',
          unread_count: c.unreadCount as number,
          last_message_at: c.lastMessageTime as string,
          last_message_text: c.lastMessage as string,
          contact: {
            id: c.waId as string,
            name: c.name as string,
            phone_number: c.waId as string
          }
        })));
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  }, []);

  const fetchMessages = useCallback(async (waId: string) => {
    try {
      const { data } = await api.get(`/whatsapp/messages/${waId}`);
      if (data.success) {
        setMessages(data.data.map((m: Record<string, unknown>) => ({
          id: m.id as string,
          conversation_id: m.waId as string,
          content_text: m.message as string,
          created_at: (m.timestamp as string) || new Date().toISOString(),
          direction: m.messageId ? 'inbound' : 'outbound',
          status: 'delivered',
          message_type: 'text'
        })));
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }, []);

  // Polling for updates
  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConversation) {
        fetchMessages(activeConversation.id);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations, activeConversation, fetchMessages]);

  const handleManualRefresh = useCallback(() => {
    fetchConversations();
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
    setResyncToken(n => n + 1);
  }, [fetchConversations, activeConversation, fetchMessages]);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    if (activeConversation?.id === conv.id) return;
    setActiveConversation(conv);
    setActiveContact(conv.contact ?? null);
    setMessages([]);
    fetchMessages(conv.id);
    autoSelectedForDeepLinkRef.current = conv.id;
    router.replace(`/inbox?c=${conv.id}`, { scroll: false });
  }, [activeConversation?.id, router, fetchMessages]);

  const handleCloseConversation = useCallback(() => {
    setActiveConversation(null);
    setActiveContact(null);
    setMessages([]);
    autoSelectedForDeepLinkRef.current = null;
    router.replace("/inbox", { scroll: false });
  }, [router]);

  const handleNewMessage = useCallback(async (msg: Message) => {
    // Optimistic UI update
    setMessages(prev => [...prev, msg]);
    try {
      await api.post('/whatsapp/send', {
        conversation_id: msg.conversation_id,
        content_text: msg.content_text,
        message_type: msg.message_type
      });
      fetchMessages(msg.conversation_id); // Refresh after sending
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }, [fetchMessages]);

  const hasActiveConv = !!activeConversation;

  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden sm:-m-6">
      {whatsappConnected === false && (
        <div className="flex shrink-0 items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
          <WifiOff className="h-4 w-4 text-amber-400" />
          <p className="text-xs text-amber-400">
            WhatsApp® is not connected. Go to Settings to connect your account.
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className={cn("flex h-full flex-1 lg:flex-none", hasActiveConv ? "hidden lg:flex" : "flex")}>
          <ConversationList
            activeConversationId={activeConversation?.id ?? null}
            onSelect={handleSelectConversation}
            conversations={conversations}
            onConversationsLoaded={() => { }}
            resyncToken={resyncToken}
          />
        </div>

        <div className={cn("flex h-full min-w-0 flex-1 lg:flex", hasActiveConv ? "flex" : "hidden lg:flex")}>
          <MessageThread
            conversation={activeConversation}
            contact={activeContact}
            messages={messages}
            onMessagesLoaded={() => { }}
            onNewMessage={handleNewMessage}
            onUpdateMessage={() => { }}
            onStatusChange={() => { }}
            onAssignChange={() => { }}
            onBack={handleCloseConversation}
            resyncToken={resyncToken}
            onRefresh={handleManualRefresh}
          />
        </div>

        <div className="hidden lg:block">
          <ContactSidebar contact={activeContact} />
        </div>
      </div>
    </div>
  );
}
