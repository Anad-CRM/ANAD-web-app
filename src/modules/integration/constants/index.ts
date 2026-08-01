import { IntegrationItem } from "../types";

export const INTEGRATION_LIST: IntegrationItem[] = [
  { id: "1", name: "WhatsApp Business", description: "Receive new leads from WhatsApp Business in your account", iconType: "whatsapp", actionText: "Connect" },
  { id: "2", name: "Facebook & Instagram", description: "Receive new leads from Facebook and Instagram in your account", iconType: "fb-insta", actionText: "Connect" },
  { id: "3", name: "Google Ads", description: "Receive new leads from Google Ads lead form assets in your account", iconType: "google", actionText: "Connect" },
  { id: "4", name: "Website & Others", description: "Receive leads from websites, LMS, or other sources using APIs", iconType: "web", actionText: "Regenerate" },
  { id: "5", name: "AI Auto Responder", description: "Configure AI to auto-reply to leads on WhatsApp using custom prompts", iconType: "ai", actionText: "Configure" },
  { id: "6", name: "Instagram DM", description: "Receive and reply to Instagram Direct Messages — automate leads from IG DMs", iconType: "instagram", actionText: "Connect" },
];

