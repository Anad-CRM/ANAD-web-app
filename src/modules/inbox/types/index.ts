
export type Contact = {
  id: string;
  name: string | null;
  phone_number: string;
  phone?: string;
  avatar_url?: string;
  company?: string;
  email?: string;
};

export type Profile = {
  id: string;
  full_name: string;
  user_id?: string;
  avatar_url?: string;
};

export type ConversationStatus = 'open' | 'closed' | 'pending';

export type Conversation = {
  id: string;
  contact_id: string;
  status: ConversationStatus;
  unread_count: number;
  assigned_agent_id?: string;
  last_message_at?: string;
  last_message_text?: string;
  contact?: Contact;
};

export type MessageReaction = {
  id: string;
  emoji: string;
  user_id: string;
  message_id: string;
  actor_type?: string;
  actor_id?: string;
  conversation_id?: string;
  created_at?: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  content_text: string | null;
  content_type?: string;
  sender_type?: string;
  reply_to_message_id?: string;
  created_at: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending' | 'sending';
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'template' | 'sticker' | 'voice' | 'reaction';
  media_url?: string;
  reactions?: MessageReaction[];
  template_name?: string;
  errorMessage?: string;
};

export type MessageTemplate = {
  id: string;
  name: string;
  language: string;
  category: string;
  components: Record<string, unknown>[];
  status: string;
  body_text?: string;
  header_type?: string;
  header_content?: string;
  footer_text?: string;
  buttons?: Record<string, unknown>[];
};

/** ANAD backend quick-reply template — a saved text snippet (title + message). */
export type AnadMessageTemplate = {
  id: number;
  title: string;
  message: string;
  userId: number;
  createdAt: string;
};

export type DealStage = {
  id: string;
  name: string;
  color: string;
};

export type Deal = {
  id: string;
  contact_id?: string;
  title: string;
  value: number;
  currency?: string;
  stage?: DealStage;
  created_at: string;
};

export type ContactNote = {
  id: string;
  contact_id: string;
  user_id?: string;
  note_text: string;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};
