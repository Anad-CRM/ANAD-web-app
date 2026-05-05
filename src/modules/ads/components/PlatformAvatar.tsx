import React from "react";
import Image from "next/image";
import { AuthImage } from "@/core/components/ui/AuthImage";
import { getPlatformColor } from "@/core/components/theme/colors";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Image as ImageIcon 
} from "lucide-react";

export function AdImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  if (isExternal) {
    return (
      <Image 
        src={src} 
        alt={alt ?? ""} 
        className={className} 
        style={style} 
        width={32} 
        height={32} 
        unoptimized 
      />
    );
  }
  return (
    <AuthImage src={src} alt={alt} className={className} style={style} fallbackSrc={undefined} />
  );
}

export function PlatformAvatar({
  thumbnailUrl,
  platform,
  size = 52,
  rounded = "rounded-2xl",
}: {
  thumbnailUrl?: string | null;
  platform?: string;
  size?: number;
  rounded?: string;
}) {
  const color = getPlatformColor(platform);

  if (thumbnailUrl) {
    return (
      <AdImage
        src={thumbnailUrl}
        alt={platform ?? "Ad"}
        className={`flex-shrink-0 object-cover ${rounded}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback to platform icon
  const getIcon = () => {
    const p = (platform || "").toLowerCase();
    const iconSize = size * 0.5;
    if (p.includes("facebook")) return <Facebook size={iconSize} color={color} />;
    if (p.includes("instagram")) return <Instagram size={iconSize} color={color} />;
    if (p.includes("twitter")) return <Twitter size={iconSize} color={color} />;
    if (p.includes("linkedin")) return <Linkedin size={iconSize} color={color} />;
    if (p.includes("youtube")) return <Youtube size={iconSize} color={color} />;
    return <ImageIcon size={iconSize} color={color} />;
  };

  return (
    <div
      className={`flex-shrink-0 ${rounded} flex items-center justify-center`}
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}1A`, // 10% opacity for background
      }}
    >
      {getIcon()}
    </div>
  );
}
