// Public API for the broadcasts module
export { NewBroadcastModal } from "./components/new-broadcast-modal/NewBroadcastModal";
export { useNewBroadcast } from "./hooks/useNewBroadcast";
export { LEAD_STATUSES, TEMPLATE_STATUS_CONFIG, TEMPLATE_CATEGORY_CONFIG } from "./constants/broadcastConstants";
export type { LeadStatusValue, BadgeStyle } from "./constants/broadcastConstants";
export type { NewBroadcastModalProps, TemplateSource, TemplateMessage } from "./types/broadcast.types";

