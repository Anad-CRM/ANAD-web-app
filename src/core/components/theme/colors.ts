export const COLORS = {
  primary: "#1E56A0",
  primaryDark: "#163172",
  violet: "#4e448e",
  primaryLight: "#D6E4F0",
  primaryXlight: "#EEF4FB",
  card: "#F6F6F6",
  accent: "#1E56A0",
  success: "#22C55E",
  warning: "#EE9B00",
  dark_orange: "#CA6702",
  brown: "#BB3E03",
  danger: "#9B2226",

  info: "#3B82F6",
  bg: "#F7F8FA",
  surface: "#FFFFFF",
  border: "#D6E4F0",
  text: "#0D1B3E",
  muted: "#5A7190",
  subtle: "#8BA5C0",
  anccent_green: "#005F73",
  light_green: "#94D2BD",
  light_yellow: "#E9D8A6",
  grey: "#EFEFEF",

  // ── Platform brand colors ──
  platform_facebook:  "#1877F2",
  platform_instagram: "#E1306C",
  platform_google:    "#4285F4",
  platform_youtube:   "#FF0000",
  platform_tiktok:    "#010101",
  platform_twitter:   "#1DA1F2",
  platform_linkedin:  "#0A66C2",
  platform_snapchat:  "#FFFC00",
  platform_pinterest: "#E60023",
};

/** Returns the brand colour for a given ad platform name, falling back to primary. */
export function getPlatformColor(platform?: string): string {
  if (!platform) return COLORS.primary;
  const key = `platform_${platform.toLowerCase()}` as keyof typeof COLORS;
  return (COLORS[key] as string | undefined) ?? COLORS.primary;
}
