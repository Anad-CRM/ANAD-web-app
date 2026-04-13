export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  iconType: "whatsapp" | "whatsapp-green" | "fb-insta" | "google" | "web";
  actionText: string;
}
