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
        }
      } catch {
        if (!cancelled) setErrored(true);
      }
    }

    Promise.resolve().then(() => {
      setBlobUrl(null);
      setErrored(false);
      load();
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  const displaySrc = errored || !blobUrl ? fallbackSrc : blobUrl;

  if (!displaySrc) return null;

  return (
    <Image
      src={displaySrc}
      alt={alt || ""}
      width={100}
      height={100}
      {...(rest as Record<string, unknown>)}
      unoptimized
    />
  );
}
