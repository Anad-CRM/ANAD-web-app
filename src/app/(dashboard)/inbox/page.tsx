"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
  const [contactsMap, setContactsMap] = useState<Record<string, Contact>>({});
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
            name: (c.name !== 'Agent' && c.name !== c.waId) ? c.name as string : null,
            phone_number: c.waId as string,
            phone: c.waId as string,
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
        setMessages(data.data.map((m: Record<string, unknown>) => {
          const direction = m.direction === 'outbound' ? 'outbound' : 'inbound';
          const rawMsgType = (m.messageType as string) || 'text';
          // Map backend message types to frontend content_type
          const contentTypeMap: Record<string, string> = {
            text: 'text', image: 'image', audio: 'audio',
            video: 'video', document: 'document', template: 'template',
            sticker: 'image', voice: 'audio',
          };
          return {
            id: m.id as string,
            conversation_id: m.waId as string,
            content_text: (m.message as string) || null,
            created_at: (m.timestamp as string) || new Date().toISOString(),
            direction,
            sender_type: direction === 'outbound' ? 'agent' : 'customer',
            status: (m.status as string) || 'delivered',
            message_type: (rawMsgType as Message['message_type']),
            content_type: contentTypeMap[rawMsgType] || 'text',
            media_url: m.mediaUrl ? (
              (m.mediaUrl as string).startsWith('/whatsapp/media/')
                ? `/api${m.mediaUrl as string}`
                : (m.mediaUrl as string)
            ) : undefined,
            errorMessage: (m.errorMessage as string) || undefined,
            reply_to_message_id: (m.replyToMessageId as string) || undefined,
          };

        }));
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

  const handleConversationsLoaded = useCallback((loaded: Conversation[]) => {
    const newMap: Record<string, Contact> = {};
    loaded.forEach(c => {
      if (c.contact) {
        newMap[c.id] = c.contact;
      }
    });
    setContactsMap(prev => ({ ...prev, ...newMap }));
  }, []);

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

  const handleNewMessage = useCallback((msg: Message) => {
    // message-thread.tsx handles the actual API send.
    // Here we only do the optimistic UI update for messages that
    // don't already exist in the list (avoid duplicates on refresh).
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const handleUpdateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const conversationsWithContacts = useMemo(() => {
    return conversations.map(conv => {
      const existingContact = contactsMap[conv.id];
      const name = (existingContact?.name && existingContact.name !== existingContact.id)
        ? existingContact.name
        : (conv.contact?.name && conv.contact.name !== conv.id)
          ? conv.contact.name
          : conv.id;
      return {
        ...conv,
        contact: {
          ...conv.contact,
          name: name,
          avatar_url: existingContact?.avatar_url || conv.contact?.avatar_url,
          phone: conv.id,
          phone_number: conv.id,
        } as Contact
      };
    });
  }, [conversations, contactsMap]);

  const activeConversationWithContact = useMemo(() => {
    if (!activeConversation) return null;
    return conversationsWithContacts.find(c => c.id === activeConversation.id) || activeConversation;
  }, [activeConversation, conversationsWithContacts]);

  const activeContactWithContact = useMemo(() => {
    return activeConversationWithContact?.contact ?? null;
  }, [activeConversationWithContact]);

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
            conversations={conversationsWithContacts}
            onConversationsLoaded={handleConversationsLoaded}
            resyncToken={resyncToken}
          />
        </div>

        <div className={cn("flex h-full min-w-0 flex-1 lg:flex", hasActiveConv ? "flex" : "hidden lg:flex")}>
          <MessageThread
            conversation={activeConversationWithContact}
            contact={activeContactWithContact}
            messages={messages}
            onMessagesLoaded={() => { }}
            onNewMessage={handleNewMessage}
            onUpdateMessage={handleUpdateMessage}
            onStatusChange={() => { }}
            onAssignChange={() => { }}
            onBack={handleCloseConversation}
            resyncToken={resyncToken}
            onRefresh={handleManualRefresh}
          />
        </div>

        <div className="hidden lg:block">
          <ContactSidebar contact={activeContactWithContact} />
        </div>
      </div>
    </div>
  );
}
