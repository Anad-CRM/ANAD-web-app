"use client";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Conversation, Message, Contact } from "@/modules/inbox/types";
import { ConversationList } from "@/modules/inbox/components/conversation-list";
import { MessageThread } from "@/modules/inbox/components/message-thread";
import { ContactSidebar } from "@/modules/inbox/components/contact-sidebar";
import { WifiOff } from "lucide-react";
import { Suspense } from "react";
import { cn } from "@/modules/inbox/lib/utils";
import { api } from "@/core/api/axios";

function InboxPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const c = searchParams.get('c');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contactsMap, setContactsMap] = useState<Record<string, Contact>>({});
  // Only store the active ID — derive the full enriched conversation from the list
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  // Keep a ref so async callbacks always see the latest active conversation
  const activeConversationIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [whatsappConnected, setWhatsappConnected] = useState<boolean | null>(null);
  const [resyncToken, setResyncToken] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      const originalOverflow = mainEl.style.overflow;
      mainEl.style.overflow = 'hidden';
      return () => {
        mainEl.style.overflow = originalOverflow;
      };
    }
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
          is_ai_enabled: c.isAiEnabled !== false,
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

  const fetchMessages = useCallback(async (waId: string, limit = 30, offset = 0) => {
    try {
      const { data } = await api.get(`/whatsapp/messages/${waId}`, {
        params: { limit, offset }
      });

      // Guard: if the user switched chats while the request was in-flight, discard the result
      if (activeConversationIdRef.current !== waId) return;

      if (data.success) {
        const mapped: Message[] = data.data.map((m: Record<string, unknown>) => {
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
            conversation_id: waId,
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
            wamid: (m.messageId as string) || undefined,
            name: (m.name as string) || undefined,
          };
        });

        if (offset === 0) {
          // Initial load or poll refresh: replace only messages that belong to this conversation
          // (merge with optimistic outbound messages already in state for this same waId)
          setMessages(prev => {
            // Keep any optimistic temp messages for THIS conversation
            const optimistic = prev.filter(m => m.id.startsWith('temp-') && m.conversation_id === waId);
            const merged = [...mapped];
            optimistic.forEach(opt => {
              if (!merged.some(m => m.id === opt.id)) merged.push(opt);
            });
            return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        } else {
          // Pagination: prepend older messages
          if (mapped.length < limit) {
            setHasMore(false);
          }
          setMessages(prev => {
            const merged = [...mapped];
            prev.forEach((existingMsg) => {
              if (!merged.some(m => m.id === existingMsg.id)) {
                merged.push(existingMsg);
              }
            });
            return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }, []);

  // Polling for updates — use the ref so the interval always sees the latest active conversation
  // without needing to tear down / recreate the interval on every selection change
  useEffect(() => {
    void (async () => { await fetchConversations(); })();
    const interval = setInterval(() => {
      fetchConversations();
      const currentId = activeConversationIdRef.current;
      if (currentId) {
        fetchMessages(currentId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchMessages]);

  const handleManualRefresh = useCallback(() => {
    fetchConversations();
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
    setResyncToken(n => n + 1);
  }, [fetchConversations, activeConversationId, fetchMessages]);

  const handleConversationsLoaded = useCallback((loaded: Conversation[]) => {
    const newMap: Record<string, Contact> = {};
    loaded.forEach(c => {
      if (c.contact) {
        // Key contact by cleaned phone number so it matches waId
        const phone = c.contact.phone || c.contact.phone_number;
        if (phone) {
          const cleanPhone = phone.replace(/\D/g, '');
          if (cleanPhone) {
            newMap[cleanPhone] = c.contact;
          }
        }
        // Also map by primary Supabase ID
        newMap[c.id] = c.contact;
      }
    });
    setContactsMap(prev => ({ ...prev, ...newMap }));
  }, []);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    if (activeConversationIdRef.current === conv.id) return;
    activeConversationIdRef.current = conv.id;
    setActiveConversationId(conv.id);
    setMessages([]);
    setHasMore(true);
    fetchMessages(conv.id, 30, 0);
    autoSelectedForDeepLinkRef.current = conv.id;
    router.replace(`/inbox?c=${conv.id}`, { scroll: false });
  }, [router, fetchMessages]);

  const handleLoadMore = useCallback(async () => {
    if (!activeConversationId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchMessages(activeConversationId, 30, messages.length);
    setLoadingMore(false);
  }, [activeConversationId, loadingMore, hasMore, messages.length, fetchMessages]);

  useEffect(() => {
    if (c && conversations.length > 0) {
      const cleanC = c.replace(/\D/g, '');
      const cleanC10 = cleanC.slice(-10);
      const currentClean = autoSelectedForDeepLinkRef.current?.replace(/\D/g, '') || '';
      const currentClean10 = currentClean.slice(-10);
      if (currentClean10 === cleanC10) {
        return;
      }

      const conv = conversations.find(x => {
        const cleanX = x.id.replace(/\D/g, '');
        return cleanX.slice(-10) === cleanC10;
      });
      if (conv) {
        setTimeout(() => {
          handleSelectConversation(conv);
        }, 0);
      }
    }
  }, [c, conversations, handleSelectConversation]);

  const handleCloseConversation = useCallback(() => {
    activeConversationIdRef.current = null;
    setActiveConversationId(null);
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
      const cleanId = conv.id.replace(/\D/g, '');
      const existingContact = contactsMap[cleanId] || contactsMap[cleanId.slice(-10)] || contactsMap[conv.id];
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

  // Derive the active conversation and contact directly from the enriched list
  // This ensures the header always has the latest data without stale state
  const activeConversationWithContact = useMemo(() => {
    if (!activeConversationId) return null;
    return conversationsWithContacts.find(c => c.id === activeConversationId) ?? null;
  }, [activeConversationId, conversationsWithContacts]);

  const activeContactWithContact = useMemo(() => {
    return activeConversationWithContact?.contact ?? null;
  }, [activeConversationWithContact]);

  const handleAiToggle = useCallback((conversationId: string, isAiEnabled: boolean) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, is_ai_enabled: isAiEnabled } : c));
  }, []);

  const hasActiveConv = !!activeConversationId;

  return (
    <div className="-m-4 sm:-m-6 md:-m-8 flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex-col overflow-hidden">
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
            activeConversationId={activeConversationId}
            onSelect={handleSelectConversation}
            conversations={conversationsWithContacts}
            onConversationsLoaded={handleConversationsLoaded}
            resyncToken={resyncToken}
          />
        </div>

        <div className={cn("flex h-full min-w-0 flex-1 lg:flex", hasActiveConv ? "flex" : "hidden lg:flex")}>
          <MessageThread
            key={activeConversationId || 'empty'}
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
            onAiToggle={handleAiToggle}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        </div>

        <div className="hidden lg:block">
          <ContactSidebar key={activeConversationId || 'empty'} contact={activeContactWithContact} />
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <InboxPageContent />
    </Suspense>
  );
}
