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
import { leadsApi } from "@/modules/leads/api/leadsApi";
// Instagram conversations use an 'ig_' prefix on their ID to avoid collision with WhatsApp IDs

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

  /** Returns true when convId belongs to an Instagram conversation */
  const isIgConv = (convId: string) => convId.startsWith('ig_');
  /** Extracts the raw igSenderId from a prefixed conversation ID */
  const igSenderIdFromConvId = (convId: string) => convId.slice(3);

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

  const [loadingConversations, setLoadingConversations] = useState(true);

  // ─── Unified fetch: both channels in 1 API call ─────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/whatsapp/conversations');
      if (data.success) {
        const mapped: Conversation[] = data.data.map((c: Record<string, unknown>) => {
          const isIg = c.channel === 'instagram';
          const realPhone = (c.mobileNumber || c.phone) as string | undefined;
          if (isIg) {
            const igSenderId = (c.igSenderId || c.waId) as string;
            const convId = `ig_${igSenderId}`;
            const contactPhone = (realPhone && realPhone !== igSenderId && realPhone.length <= 15) ? realPhone : igSenderId;
            return {
              id: convId,
              contact_id: convId,
              lead_id: c.leadId as string | undefined,
              status: 'open' as const,
              unread_count: (c.unreadCount as number) || 0,
              last_message_at: c.lastMessageTime as string,
              last_message_text: c.lastMessage as string,
              is_ai_enabled: c.isAiEnabled === true,
              channel: 'instagram' as const,
              ig_sender_id: igSenderId,
              contact: {
                id: convId,
                name: c.name ? (c.name as string) : igSenderId,
                phone_number: contactPhone,
                phone: contactPhone,
              }
            };
          } else {
            return {
              id: c.waId as string,
              contact_id: c.waId as string,
              lead_id: c.leadId as string | undefined,
              status: 'open' as const,
              unread_count: (c.unreadCount as number) || 0,
              last_message_at: c.lastMessageTime as string,
              last_message_text: c.lastMessage as string,
              is_ai_enabled: c.isAiEnabled !== false,
              channel: 'whatsapp' as const,
              contact: {
                id: c.waId as string,
                name: (c.name !== 'Agent' && c.name !== c.waId) ? (c.name as string) : null,
                phone_number: (realPhone && realPhone.length <= 15) ? realPhone : (c.waId as string),
                phone: (realPhone && realPhone.length <= 15) ? realPhone : (c.waId as string),
              }
            };
          }
        });

        // Helper: parse timestamp that may be Unix seconds string OR ISO string
        const toMs = (t: string | undefined): number => {
          if (!t) return 0;
          if (/^\d+$/.test(t)) {
            const n = Number(t);
            return n < 10_000_000_000 ? n * 1000 : n;
          }
          return new Date(t).getTime() || 0;
        };

        mapped.sort((a, b) => toMs(b.last_message_at) - toMs(a.last_message_at));
        setConversations(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // ─── Fetch WhatsApp messages ────────────────────────────────────────────────
  const fetchWhatsappMessages = useCallback(async (waId: string, limit = 30, offset = 0) => {
    try {
      const { data } = await api.get(`/whatsapp/messages/${waId}`, { params: { limit, offset } });
      if (activeConversationIdRef.current !== waId) return;
      if (data.success) {
        const contentTypeMap: Record<string, string> = {
          text: 'text', image: 'image', audio: 'audio',
          video: 'video', document: 'document', template: 'template',
          sticker: 'image', voice: 'audio',
        };
        const mapped: Message[] = data.data.map((m: Record<string, unknown>) => {
          const direction = m.direction === 'outbound' ? 'outbound' : 'inbound';
          const rawMsgType = (m.messageType as string) || 'text';
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
            channel: 'whatsapp' as const,
          };
        });
        if (offset === 0) {
          setMessages(prev => {
            const optimistic = prev.filter(m => m.id.startsWith('temp-') && m.conversation_id === waId);
            const merged = [...mapped];
            optimistic.forEach(opt => { if (!merged.some(m => m.id === opt.id)) merged.push(opt); });
            return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        } else {
          if (mapped.length < limit) setHasMore(false);
          setMessages(prev => {
            const merged = [...mapped];
            prev.forEach(e => { if (!merged.some(m => m.id === e.id)) merged.push(e); });
            return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp messages", err);
    }
  }, []);

  // ─── Fetch Instagram messages ───────────────────────────────────────────────
  const fetchInstagramMessages = useCallback(async (igSenderId: string, convId: string, limit = 30, offset = 0) => {
    try {
      const { data } = await api.get(`/instagram/messages/${igSenderId}`, { params: { limit } });
      if (activeConversationIdRef.current !== convId) return;
      if (data.success) {
        // Convert Unix timestamp string to ISO string so parseSafeDate works
        const toIso = (ts: unknown): string => {
          if (!ts) return new Date().toISOString();
          const s = String(ts);
          if (/^\d+$/.test(s)) {
            const n = Number(s);
            return new Date(n < 10_000_000_000 ? n * 1000 : n).toISOString();
          }
          return s;
        };
        const contentTypeMap: Record<string, string> = {
          text: 'text', image: 'image', audio: 'audio',
          video: 'video', document: 'document', template: 'template',
          sticker: 'image', voice: 'audio', reaction: 'reaction',
        };
        const mapped: Message[] = data.data.map((m: Record<string, unknown>) => {
          const direction = m.direction === 'outbound' ? 'outbound' : 'inbound';
          const rawMsgType = (m.messageType as string) || 'text';
          return {
            id: m.id as string,
            conversation_id: convId,
            content_text: (m.message as string) || null,
            created_at: toIso(m.timestamp),
            direction,
            sender_type: direction === 'outbound' ? 'agent' : 'customer',
            status: (m.status as string) || 'sent',
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
            channel: 'instagram' as const,
            name: (m.name as string) || undefined,
          };
        });
        if (offset === 0) {
          setMessages(prev => {
            const optimistic = prev.filter(m => m.id.startsWith('temp-') && m.conversation_id === convId);
            const merged = [...mapped];
            optimistic.forEach(opt => { if (!merged.some(m => m.id === opt.id)) merged.push(opt); });
            return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        } else {
          if (mapped.length < limit) setHasMore(false);
          setMessages(prev => {
            const merged = [...mapped];
            prev.forEach(e => { if (!merged.some(m => m.id === e.id)) merged.push(e); });
            return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch Instagram messages", err);
    }
  }, []);

  // ─── Unified dispatcher ─────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId: string, limit = 30, offset = 0) => {
    if (isIgConv(convId)) {
      await fetchInstagramMessages(igSenderIdFromConvId(convId), convId, limit, offset);
    } else {
      await fetchWhatsappMessages(convId, limit, offset);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchInstagramMessages, fetchWhatsappMessages]);

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
    // Encode the conv id for the URL (ig_ prefix is safe in URLs)
    router.replace(`/inbox?c=${encodeURIComponent(conv.id)}`, { scroll: false });
  }, [router, fetchMessages]);

  const handleLoadMore = useCallback(async () => {
    if (!activeConversationId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchMessages(activeConversationId, 30, messages.length);
    setLoadingMore(false);
  }, [activeConversationId, loadingMore, hasMore, messages.length, fetchMessages]);

  useEffect(() => {
    if (c && conversations.length > 0) {
      const decoded = decodeURIComponent(c);
      // Exact match (handles ig_ prefixed Instagram conv IDs)
      const exactMatch = conversations.find(x => x.id === decoded);
      if (exactMatch) {
        if (autoSelectedForDeepLinkRef.current === decoded) return;
        setTimeout(() => { handleSelectConversation(exactMatch); }, 0);
        return;
      }

      // Fuzzy phone-number match for WhatsApp
      const cleanC = decoded.replace(/\D/g, '');
      const cleanC10 = cleanC.slice(-10);
      const currentClean = autoSelectedForDeepLinkRef.current?.replace(/\D/g, '') || '';
      if (currentClean.slice(-10) === cleanC10) return;

      const conv = conversations.find(x => {
        if (x.channel === 'instagram') return false; // skip Instagram in fuzzy match
        const cleanX = x.id.replace(/\D/g, '');
        return cleanX.slice(-10) === cleanC10;
      });
      if (conv) {
        setTimeout(() => { handleSelectConversation(conv); }, 0);
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
      const isIG = conv.channel === 'instagram';
      const igSenderId = String(conv.ig_sender_id || '');
      const cleanId = String(conv.id || '').replace(/\D/g, '');
      const existingContact = contactsMap[cleanId] || contactsMap[cleanId.slice(-10)] || contactsMap[conv.id];
      const name = (existingContact?.name && existingContact.name !== existingContact.id)
        ? existingContact.name
        : (conv.contact?.name && conv.contact.name !== conv.id)
          ? conv.contact.name
          : (isIG ? igSenderId : conv.id);
      const rawPhone = conv.contact?.phone || conv.contact?.phone_number;
      const isRealPhone = (num?: unknown) => {
        if (!num) return false;
        const cleanNum = String(num).replace(/\D/g, '');
        const cleanIg = String(igSenderId).replace(/\D/g, '');
        if (!cleanNum || cleanNum === cleanIg || cleanNum.length > 15) return false;
        return true;
      };
      const phoneDisplay = isRealPhone(rawPhone) ? String(rawPhone) : (isIG ? igSenderId : String(conv.id));

      return {
        ...conv,
        contact: {
          ...conv.contact,
          name: name,
          avatar_url: existingContact?.avatar_url || conv.contact?.avatar_url,
          phone: phoneDisplay,
          phone_number: phoneDisplay,
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

  const handleClearChat = useCallback(async () => {
    const currentId = activeConversationIdRef.current;
    if (!currentId) return;
    try {
      if (isIgConv(currentId)) {
        const igSenderId = igSenderIdFromConvId(currentId);
        await api.delete(`/instagram/conversations/${igSenderId}`);
      } else {
        await api.delete(`/whatsapp/conversations/${currentId}`);
      }
      setMessages([]);
      await fetchConversations();
    } catch (err) {
      console.error("Failed to clear chat", err);
      throw err;
    }
  }, [fetchConversations]);

  const handleDeleteChat = useCallback(async () => {
    const currentId = activeConversationIdRef.current;
    if (!currentId) return;
    try {
      if (isIgConv(currentId)) {
        const igSenderId = igSenderIdFromConvId(currentId);
        await api.delete(`/instagram/conversations/${igSenderId}`);
      } else {
        await api.delete(`/whatsapp/conversations/${currentId}`);
      }
      handleCloseConversation();
      await fetchConversations();
    } catch (err) {
      console.error("Failed to delete chat", err);
      throw err;
    }
  }, [handleCloseConversation, fetchConversations]);

  const handleDeleteLead = useCallback(async () => {
    const currentId = activeConversationIdRef.current;
    if (!currentId) return;

    const activeConv = conversationsWithContacts.find(c => c.id === currentId);
    const leadId = activeConv?.lead_id;

    try {
      if (leadId) {
        await leadsApi.deleteLead(leadId, false);
      }
      // Also delete the chat thread for this contact
      if (isIgConv(currentId)) {
        const igSenderId = igSenderIdFromConvId(currentId);
        await api.delete(`/instagram/conversations/${igSenderId}`);
      } else {
        await api.delete(`/whatsapp/conversations/${currentId}`);
      }
      handleCloseConversation();
      await fetchConversations();
    } catch (err) {
      console.error("Failed to delete lead", err);
      throw err;
    }
  }, [conversationsWithContacts, handleCloseConversation, fetchConversations]);

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
            loading={loadingConversations}
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
          <ContactSidebar
            key={activeConversationId || 'empty'}
            contact={activeContactWithContact}
            onClearChat={handleClearChat}
            onDeleteChat={handleDeleteChat}
            onDeleteLead={handleDeleteLead}
          />
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
