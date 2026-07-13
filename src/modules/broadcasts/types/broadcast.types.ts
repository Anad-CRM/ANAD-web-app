// Re-export shared API types so consumers import from the module,
// not directly from core/api
export type {
  MetaTemplate,
  MetaTemplateComponent,
  Broadcast,
  BroadcastRecipient,
  BroadcastStatus,
  RecipientStatus,
  CreateBroadcastPayload,
} from "@/core/api/broadcastApi";

export type { TemplateMessage } from "@/core/api/templateApi";

/**
 * A unified template shape used across the broadcast wizard steps.
 * - `source: "meta"` → WhatsApp-approved template from Meta Graph API
 * - `source: "custom"` → Local message template saved in the DB
 */
export type TemplateSource =
  | {
      source: "meta";
      id: string;
      name: string;
      status: string;
      language: string;
      category: string;
      /** Full component list (HEADER, BODY, FOOTER, BUTTONS) */
      components: { type: string; text?: string }[];
    }
  | {
      source: "custom";
      id: string;
      name: string;
      /** The raw message body text */
      body: string;
    };

// Modal-specific types
export interface NewBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

