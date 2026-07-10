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

// Modal-specific types
export interface NewBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}
