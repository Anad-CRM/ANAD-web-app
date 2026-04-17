import React, { useEffect, useState, ImgHTMLAttributes } from "react";
import { api } from "@/core/api/axios";

interface AuthImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Full URL of the protected image */
  src: string;
  /** Fallback src shown while loading or on error */
  fallbackSrc?: string;
}

/**
 * Drop-in replacement for <img> when the image endpoint requires
 * the `accesstoken` header.  It fetches the image through the axios
 * instance (which auto-attaches the token) and creates a temporary
 * blob URL for the browser to render.
 */
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

    setBlobUrl(null);
    setErrored(false);
    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  const displaySrc = errored || !blobUrl ? fallbackSrc : blobUrl;

  return <img src={displaySrc} alt={alt} {...rest} />;
}
