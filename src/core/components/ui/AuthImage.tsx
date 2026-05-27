import React, { useState, ImgHTMLAttributes } from "react";
import Image from "next/image";

interface AuthImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
}

export function AuthImage({ src, fallbackSrc, alt, ...rest }: AuthImageProps) {
  const [errored, setErrored] = useState(false);
  const imageClassName = rest.className || "";
  const imageStyle = rest.style as React.CSSProperties | undefined;

  const displaySrc = errored || !src ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden ${imageClassName}`} style={imageStyle}>
      {displaySrc ? (
        <Image
          src={displaySrc}
          alt={alt || ""}
          width={100}
          height={100}
          className="absolute inset-0 h-full w-full object-cover"
          unoptimized
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#EEF4FB] text-[#1E56A0]">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
}
