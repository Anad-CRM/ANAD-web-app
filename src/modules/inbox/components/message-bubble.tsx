"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn, parseSafeDate } from "../lib/utils";
import { getToken } from "@/core/utils/auth";
import type { Message, MessageReaction } from "../types";
import {
  Clock,
  Check,
  CheckCheck,
  XCircle,
  FileText,
  MapPin,
  LayoutTemplate,
  ImageOff,
  CornerDownLeft,
  Play,
  Pause,
  Mic,
} from "lucide-react";
import { format } from "date-fns";
import { ReplyQuote } from "./reply-quote";
import { MessageReactions } from "./message-reactions";

interface MessageBubbleProps {
  message: Message;
  /** Pre-computed quote info for messages that reply to another. */
  reply?: { authorLabel: string; preview: string } | null;
  reactions?: MessageReaction[];
  currentUserId?: string;
  onToggleReaction?: (emoji: string) => void;
}

function StatusIcon({ status, isOutbound }: { status: Message["status"]; isOutbound?: boolean }) {
  const baseColor = isOutbound
    ? status === "read" ? "text-blue-200" : "text-white/70"
    : status === "read" ? "text-blue-500" : "text-slate-400";

  switch (status) {
    case "sending":
      return <Clock className={cn("h-3 w-3", baseColor)} />;
    case "sent":
      return <Check className={cn("h-3 w-3", baseColor)} />;
    case "delivered":
      return <CheckCheck className={cn("h-3 w-3", baseColor)} />;
    case "read":
      return <CheckCheck className={cn("h-3 w-3", baseColor)} />;
    case "failed":
      return <XCircle className="h-3 w-3 text-red-400" />;
    default:
      return null;
  }
}

function MediaUnavailable({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#EEF4FB] border border-[#D6E4F0] px-3 py-2 text-xs text-[#5A7190]">
      <ImageOff className="h-4 w-4 shrink-0 text-[#8BA5C0]" />
      <span>{label} unavailable</span>
    </div>
  );
}

function AudioPlayer({ url, isAgent }: { url: string; isAgent: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let blobUrl: string | null = null;
    const load = async () => {
      try {
        if (url.startsWith("/api/whatsapp/media/")) {
          const token = getToken();
          const res = await fetch(url, {
            headers: token ? { accesstoken: token } : {},
          });
          if (!res.ok) throw new Error("Failed to load audio");
          const blob = await res.blob();
          blobUrl = URL.createObjectURL(blob);
          setSrc(blobUrl);
        } else {
          setSrc(url);
        }
      } catch {
        setError(true);
      }
    };
    load();
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => { });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const val = parseFloat(e.target.value);
    audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const formatAudioTime = (timeSecs: number) => {
    if (isNaN(timeSecs)) return "0:00";
    const mins = Math.floor(timeSecs / 60);
    const secs = Math.floor(timeSecs % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) return <MediaUnavailable label="Audio" />;
  if (!src) return (
    <div className="flex h-[56px] w-[280px] items-center justify-center rounded-xl bg-[#EEF4FB] border border-[#D6E4F0]">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1E56A0] border-t-transparent" />
    </div>
  );

  return (
    <div className="flex items-center gap-3 rounded-xl p-1 min-w-[270px] max-w-[340px] select-none">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* WhatsApp Profile Avatar on Left with Mic indicator */}
      <div className="relative h-10 w-10 shrink-0 rounded-full bg-[#CBD5E1] flex items-center justify-center text-slate-600 font-bold text-sm shadow-inner">
        {isAgent ? "A" : "C"}
        <span className={cn(
          "absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-white shadow-sm",
          isAgent ? "bg-[#1E56A0]" : "bg-[#25D366]"
        )}>
          <Mic className="h-2.5 w-2.5 text-white" />
        </span>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1E56A0] bg-white transition-all duration-200 active:scale-90 shadow-sm border border-[#D6E4F0]/40 hover:bg-slate-50"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-[#1E56A0] text-[#1E56A0]" />
        ) : (
          <Play className="h-4 w-4 fill-[#1E56A0] text-[#1E56A0] ml-0.5" />
        )}
      </button>

      {/* Progress & Custom Slider */}
      <div className="flex flex-1 flex-col gap-0.5">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-[#CBD5E1] accent-[#1E56A0] outline-none"
          style={{
            background: `linear-gradient(to right, #1E56A0 0%, #1E56A0 ${duration ? (currentTime / duration) * 100 : 0
              }%, #CBD5E1 ${duration ? (currentTime / duration) * 100 : 0
              }%, #CBD5E1 100%)`
          }}
        />
        <div className="flex justify-between items-center text-[9px] text-[#5A7190] font-semibold px-0.5">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

function MediaImage({ url, alt, isSticker }: { url: string; alt: string; isSticker?: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadImage = useCallback(async () => {
    if (!url) return;

    if (url.startsWith("/api/whatsapp/media/")) {
      try {
        const token = getToken();
        const res = await fetch(url, {
          headers: token ? { accesstoken: token } : {},
        });
        if (!res.ok) throw new Error("Failed to load media");
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        setSrc(blobUrl);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    } else {
      setSrc(url);
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    loadImage();
    return () => {
      if (src?.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadImage]);

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-lg bg-[#EEF4FB] border border-[#D6E4F0]",
        isSticker ? "h-28 w-28" : "h-40 w-60"
      )}>
        <ImageOff className="h-8 w-8 text-[#8BA5C0]" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-lg bg-[#EEF4FB] border border-[#D6E4F0]",
        isSticker ? "h-28 w-28" : "h-40 w-60"
      )}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1E56A0] border-t-transparent" />
      </div>
    );
  }

  return (
    <img
      src={src ?? ""}
      alt={alt}
      className={cn(
        isSticker
          ? "h-32 w-32 object-contain bg-transparent select-none"
          : "max-h-64 max-w-60 rounded-xl object-cover shadow-sm select-none transition-all duration-300 hover:brightness-95 cursor-pointer"
      )}
      onError={() => setError(true)}
    />
  );
}

function checkRealCaption(text: string | null | undefined): boolean {
  if (!text) return false;
  const clean = text.trim().toLowerCase();
  return (
    clean !== "[image]" &&
    clean !== "[sticker]" &&
    clean !== "[voice note]" &&
    clean !== "[audio]" &&
    clean !== "[voice]" &&
    clean !== "[video]" &&
    clean !== "[document]" &&
    clean !== "[reaction]" &&
    !clean.startsWith("[reaction]:")
  );
}

function MessageContent({ message, overlay, isOutbound }: { message: Message; overlay?: React.ReactNode; isOutbound?: boolean }) {
  const displayType = message.content_type || message.message_type || 'text';
  const hasRealCaption = checkRealCaption(message.content_text);
  // Text color adapts to the bubble background
  const textClass = isOutbound ? "text-white" : "text-slate-800";
  const subTextClass = isOutbound ? "text-white/90" : "text-slate-800";

  switch (displayType) {
    case "text":
      return (
        <p className={`whitespace-pre-wrap break-words text-sm ${textClass}`}>
          {message.content_text}
        </p>
      );

    case "image":
    case "sticker": {
      const isSticker = displayType === "sticker" || message.message_type === "sticker";
      return (
        <div className="relative overflow-hidden rounded-xl">
          {message.media_url ? (
            <MediaImage url={message.media_url} alt={isSticker ? "Sticker" : "Shared image"} isSticker={isSticker} />
          ) : (
            <MediaUnavailable label={isSticker ? "Sticker" : "Image"} />
          )}
          {!isSticker && overlay}
          {hasRealCaption && !isSticker && (
            <p className={`mt-2 whitespace-pre-wrap break-words text-sm px-2 pb-1 ${subTextClass}`}>
              {message.content_text}
            </p>
          )}
        </div>
      );
    }

    case "video":
      return (
        <div>
          {message.media_url ? (
            <video
              src={message.media_url}
              controls
              className="max-h-64 max-w-60 rounded-lg shadow-sm"
            />
          ) : (
            <MediaUnavailable label="Video" />
          )}
          {hasRealCaption && (
            <p className={`mt-1 whitespace-pre-wrap break-words text-sm ${subTextClass}`}>
              {message.content_text}
            </p>
          )}
        </div>
      );

    case "audio": {
      const isAgent = message.sender_type === "agent" || message.sender_type === "bot";
      return (
        <div>
          {message.media_url ? (
            <AudioPlayer url={message.media_url} isAgent={isAgent} />
          ) : (
            <MediaUnavailable label="Audio" />
          )}
        </div>
      );
    }

    case "document":
      if (!message.media_url) {
        return <MediaUnavailable label={message.content_text || "Document"} />;
      }
      return (
        <a
          href={message.media_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isOutbound
              ? "bg-white/15 hover:bg-white/25 text-white"
              : "bg-[#EEF4FB] hover:bg-[#D6E4F0] border border-[#D6E4F0] text-[#0D1B3E]"
          )}
        >
          <FileText className={cn("h-5 w-5 shrink-0", isOutbound ? "text-white/80" : "text-[#1E56A0]")} />
          <span className="truncate">
            {message.content_text || "Document"}
          </span>
        </a>
      );

    case "template":
      return (
        <div>
          <span className={cn(
            "mb-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
            isOutbound ? "bg-white/20 text-white" : "bg-[#1E56A0]/10 text-[#1E56A0]"
          )}>
            <LayoutTemplate className="h-3 w-3" />
            Template
          </span>
          {message.content_text && (
            <p className={`mt-1 whitespace-pre-wrap break-words text-sm ${subTextClass}`}>
              {message.content_text}
            </p>
          )}
        </div>
      );

    case "location":
      return (
        <div className={`flex items-center gap-2 text-sm ${textClass}`}>
          <MapPin className={cn("h-4 w-4 shrink-0", isOutbound ? "text-white/70" : "text-[#5A7190]")} />
          <span>{message.content_text || "Location shared"}</span>
        </div>
      );

    case "interactive": {
      return (
        <div className="flex flex-col gap-0.5">
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide",
            isOutbound ? "text-white/70" : "text-[#1E56A0]"
          )}>
            <CornerDownLeft className="h-3 w-3" />
            Button reply
          </span>
          <p className={`whitespace-pre-wrap break-words text-sm ${textClass}`}>
            {message.content_text || "[Interactive reply]"}
          </p>
        </div>
      );
    }

    default:
      return (
        <p className={`whitespace-pre-wrap break-words text-sm ${textClass}`}>
          {message.content_text || "[Unsupported message type]"}
        </p>
      );
  }
}

export function MessageBubble({
  message,
  reply,
  reactions,
  currentUserId,
  onToggleReaction,
}: MessageBubbleProps) {
  const isAgent = message.sender_type === "agent" || message.sender_type === "bot";
  const isSticker = message.message_type === "sticker";
  const hasRealCaption = checkRealCaption(message.content_text);
  const isImageOnly = (message.content_type === "image" || message.message_type === "image") && !hasRealCaption && !isSticker;

  // Detect system notification messages (AI quota errors saved by webhookProcessor)
  // The backend stores these with name='System'
  const isSystemMessage = message.name === "System";

  let time = "";
  if (message.created_at) {
    const d = parseSafeDate(message.created_at);
    if (!isNaN(d.getTime())) {
      time = format(d, "h:mm a");
    }
  }

  // ── System / AI-error notification pill ─────────────────────────────────
  // Rendered as a centred amber warning chip, NOT as a regular chat bubble.
  // This prevents the duplicate: "blue bubble + red box below" problem.
  if (isSystemMessage) {
    // Strip the leading emoji if present (we re-add our own icon)
    const rawText = (message.content_text ?? "").replace(/^[⚠️\s]+/, "").trim();
    return (
      <div className="flex w-full justify-center py-1">
        <div className="flex max-w-sm items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white text-[11px] font-bold select-none">!</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-amber-800 leading-snug">{rawText}</p>
            <p className="mt-0.5 text-[10px] text-amber-500">{time}</p>
          </div>
        </div>
      </div>
    );
  }

  const imageOverlay = isImageOnly ? (
    <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm shadow-sm select-none">
      <span className="text-[9px] text-white/90 font-medium">{time}</span>
      {isAgent && <StatusIcon status={message.status} isOutbound={true} />}
    </div>
  ) : null;

  return (
    <div
      className={cn(
        "flex flex-col relative",
        isAgent ? "items-end" : "items-start",
        reactions && reactions.length > 0 ? "pb-5" : "",
      )}
    >
      <div
        className={cn(
          "relative max-w-full transition-all duration-150",
          isSticker
            ? "bg-transparent shadow-none p-0"
            : isAgent
            ? cn(
                "rounded-2xl rounded-tr-sm shadow-md",
                "bg-gradient-to-br from-[#1E56A0] to-[#2563EB]",
                isImageOnly ? "p-1" : "px-3.5 py-2.5"
              )
            : cn(
                "rounded-2xl rounded-tl-sm bg-white shadow-sm ring-1 ring-slate-200/80",
                isImageOnly ? "p-1" : "px-3.5 py-2.5"
              )
        )}
      >
        {reply && !isSticker && (
          <ReplyQuote authorLabel={reply.authorLabel} preview={reply.preview} />
        )}
        <MessageContent
          message={message}
          overlay={isImageOnly ? imageOverlay : undefined}
          isOutbound={isAgent}
        />

        {!isSticker && !isImageOnly && (
          <div className="mt-1 flex items-center gap-1 justify-end select-none">
            <span
              className={cn(
                "text-[9px] font-medium",
                isAgent ? "text-white/60" : "text-slate-400"
              )}
            >
              {time}
            </span>
            {isAgent && <StatusIcon status={message.status} isOutbound={true} />}
          </div>
        )}
      </div>

      {/* Reaction pills */}
      {reactions && reactions.length > 0 && onToggleReaction && (
        <div
          className={cn(
            "absolute bottom-0 z-20 select-none",
            isAgent ? "right-2" : "left-2",
          )}
        >
          <MessageReactions
            reactions={reactions}
            currentUserId={currentUserId}
            onToggle={onToggleReaction}
          />
        </div>
      )}

      {isSticker && (
        <div className="mt-1 flex items-center gap-1 justify-end px-1 select-none">
          <span className="text-[9px] text-slate-400 font-medium">{time}</span>
          {isAgent && <StatusIcon status={message.status} isOutbound={true} />}
        </div>
      )}

      {/* Only show error box for non-system failed messages.
          System messages already render the error as content above. */}
      {message.status === "failed" && message.errorMessage && !isSystemMessage && (
        <div className="mt-1.5 flex items-start gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 max-w-xs shadow-sm">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
          <p className="text-xs text-red-600 leading-snug break-words">{message.errorMessage}</p>
        </div>
      )}
    </div>
  );
}
