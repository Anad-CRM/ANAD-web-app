import React, { useEffect, useState, ImgHTMLAttributes } from "react";
import Image from "next/image";
import { api } from "@/core/api/axios";

interface AuthImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
}

export function AuthImage({ src, fallbackSrc, alt, ...rest }: AuthImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [errored, setErrored]  = useState(false);
  const [loading, setLoading] = useState(true);
  const imageClassName = rest.className || "";
  const imageStyle = rest.style as React.CSSProperties | undefined;

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      try {
        const response = await api.get(src, { responseType: "blob" });
        if (!cancelled) {
          objectUrl = URL.createObjectURL(response.data);
          setBlobUrl(objectUrl);
          setErrored(false);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setErrored(true);
          setLoading(false);
        }
      }
    }

    Promise.resolve().then(() => {
      setBlobUrl(null);
      setErrored(false);
      setLoading(true);
      load();
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  const displaySrc = errored || !blobUrl ? fallbackSrc : blobUrl;

  return (
    <div className={`relative overflow-hidden ${imageClassName}`} style={imageStyle}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <div className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        </div>
      )}

      {displaySrc ? (
        <Image
          src={displaySrc}
          alt={alt || ""}
          width={100}
          height={100}
          className="absolute inset-0 h-full w-full object-cover"
          unoptimized
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
