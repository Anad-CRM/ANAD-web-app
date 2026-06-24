"use client";

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from "react";
import { Send, LayoutTemplate, Paperclip, Mic, Square, X, FileText, Image as ImageIcon, Music } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { ReplyQuote } from "./reply-quote";
import { api } from "@/core/api/axios";
import { toast } from "sonner";

interface ReplyDraft {
  id: string;
  authorLabel: string;
  preview: string;
}

export interface SendMediaPayload {
  message_type: "image" | "document" | "audio";
  media_id: string;
  caption?: string;
  filename?: string;
}

interface MessageComposerProps {
  conversationId: string;
  sessionExpired: boolean;
  onSend: (text: string, replyToId?: string) => void;
  onSendMedia?: (payload: SendMediaPayload, replyToId?: string) => void;
  onOpenTemplates: () => void;
  replyTo?: ReplyDraft | null;
  onClearReply?: () => void;
  prefillText?: string;
  onPrefillConsumed?: () => void;
}

// ── File type helpers ────────────────────────────────────────────────
function getMsgTypeForFile(file: File): "image" | "audio" | "document" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
}

function AttachmentPreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const type = getMsgTypeForFile(file);
  const sizeKb = Math.round(file.size / 1024);
  const Icon = type === "image" ? ImageIcon : type === "audio" ? Music : FileText;
  return (
    <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#D6E4F0] bg-white px-3 py-2 shadow-sm">
      <Icon className="h-4 w-4 shrink-0 text-[#1E56A0]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-[#0D1B3E]">{file.name}</p>
        <p className="text-[10px] text-[#5A7190]">{sizeKb} KB</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#5A7190] hover:bg-[#EEF4FB] hover:text-red-500"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function MessageComposer({
  sessionExpired,
  onSend,
  onSendMedia,
  onOpenTemplates,
  replyTo,
  onClearReply,
  prefillText,
  onPrefillConsumed,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Sync prefill text from parent (e.g. template selection)
  useEffect(() => {
    if (!prefillText) return;
    setText(prefillText);
    onPrefillConsumed?.();
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillText]);

  const canSend = true;
  const readOnly = !canSend;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, []);

  // ── Upload a file to /whatsapp/upload-media → get media_id ──────────
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/whatsapp/upload-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!data.success || !data.media_id) throw new Error("Upload failed");
    return data.media_id as string;
  }, []);

  // ── Send text ────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (sending) return;

    // If a file is pending, upload + send as media
    if (pendingFile) {
      setSending(true);
      try {
        const media_id = await uploadFile(pendingFile);
        const msgType = getMsgTypeForFile(pendingFile);
        onSendMedia?.({ message_type: msgType, media_id, filename: pendingFile.name, caption: text.trim() || undefined }, replyTo?.id);
        setPendingFile(null);
        setText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      } catch {
        toast.error("Failed to upload file. Please try again.");
      } finally {
        setSending(false);
      }
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      onSend(trimmed, replyTo?.id);
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } finally {
      setSending(false);
    }
  }, [text, sending, onSend, onSendMedia, replyTo?.id, pendingFile, uploadFile]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      adjustHeight();
    },
    [adjustHeight]
  );

  // ── Attachment picker ────────────────────────────────────────────────
  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce WhatsApp size limits
    const maxSizes: Record<string, number> = { image: 5, audio: 16, document: 100 };
    const msgType = getMsgTypeForFile(file);
    const maxMb = maxSizes[msgType];
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`File too large. Max size for ${msgType} is ${maxMb}MB.`);
      return;
    }

    setPendingFile(file);
    // Reset the input so the same file can be re-selected after removal
    e.target.value = "";
  }, []);

  // ── Voice recorder ───────────────────────────────────────────────────
  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      // Stop recording → triggers ondataavailable → onstop
      mediaRecorderRef.current?.stop();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecording(false);
      setRecordingSeconds(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detect the best MIME type the browser actually supports.
      // WhatsApp Cloud API accepts audio/aac, audio/mp4, audio/ogg, audio/mpeg.
      // Browsers mostly record to audio/webm — Meta accepts webm as well.
      const preferredTypes = [
        "audio/mp4",          // Safari, modern Chrome
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ];
      const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) || "";
      const ext = mimeType.startsWith("audio/mp4") ? "m4a"
        : mimeType.startsWith("audio/ogg") ? "ogg"
        : "webm";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const actualMime = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: actualMime });
        const file = new File([blob], `voice-note-${Date.now()}.${ext}`, { type: actualMime });

        setSending(true);
        try {
          const media_id = await uploadFile(file);
          onSendMedia?.({ message_type: "audio", media_id }, replyTo?.id);
        } catch {
          toast.error("Failed to send voice note.");
        } finally {
          setSending(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone permissions.");
    }
  }, [isRecording, onSendMedia, replyTo?.id, uploadFile]);

  const formatRecordingTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border-t border-[#D6E4F0] bg-[#F6F6F6] p-3 shadow-inner">
      {replyTo && (
        <div className="mb-2">
          <ReplyQuote
            authorLabel={replyTo.authorLabel}
            preview={replyTo.preview}
            onDismiss={onClearReply}
          />
        </div>
      )}

      {sessionExpired && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-2">
          <p className="text-xs text-amber-700 font-medium">
            24-hour session expired. Use a template to re-engage.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-100/50"
            onClick={onOpenTemplates}
          >
            <LayoutTemplate className="mr-1 h-3 w-3" />
            Templates
          </Button>
        </div>
      )}

      {/* Pending file preview */}
      {pendingFile && (
        <AttachmentPreview file={pendingFile} onRemove={() => setPendingFile(null)} />
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-xs font-medium text-red-600">
            Recording… {formatRecordingTime(recordingSeconds)}
          </span>
          <span className="text-[10px] text-red-400">Tap mic to stop &amp; send</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Templates */}
        <Button
          variant="ghost"
          size="sm"
          title="Send template"
          className="h-9 w-9 shrink-0 p-0 text-[#5A7190] hover:text-[#1E56A0] hover:bg-[#EEF4FB]"
          onClick={onOpenTemplates}
          disabled={readOnly || isRecording}
        >
          <LayoutTemplate className="h-4 w-4" />
        </Button>

        {/* Attachment */}
        <Button
          variant="ghost"
          size="sm"
          title="Attach file (image / document / audio)"
          className="h-9 w-9 shrink-0 p-0 text-[#5A7190] hover:text-[#1E56A0] hover:bg-[#EEF4FB]"
          onClick={handleAttachmentClick}
          disabled={readOnly || isRecording || sending}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text area — hidden while recording */}
        {!isRecording && (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              pendingFile
                ? "Add a caption (optional)…"
                : readOnly
                ? "Read-only — viewers can browse but not reply"
                : "Type a message… (Shift+Enter for new line)"
            }
            disabled={readOnly}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-xl border border-[#D6E4F0] bg-white px-4 py-2.5 text-sm text-[#0D1B3E] placeholder-slate-400 outline-none transition-colors focus:border-[#1E56A0]/70 focus:ring-1 focus:ring-[#1E56A0]/20",
              readOnly && "cursor-not-allowed opacity-50"
            )}
          />
        )}

        {/* Voice mic / stop */}
        {!pendingFile && (
          <Button
            variant="ghost"
            size="sm"
            title={isRecording ? "Stop recording" : "Record voice note"}
            onClick={handleMicClick}
            disabled={readOnly || sending}
            className={cn(
              "h-9 w-9 shrink-0 p-0 transition-colors",
              isRecording
                ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                : "text-[#5A7190] hover:text-[#1E56A0] hover:bg-[#EEF4FB]"
            )}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}

        {/* Send */}
        {(text.trim() || pendingFile) && !isRecording && (
          <Button
            size="sm"
            disabled={readOnly || sending}
            onClick={handleSend}
            className="h-9 w-9 shrink-0 bg-[#1E56A0] text-white p-0 hover:bg-[#163172] rounded-full shadow-sm disabled:opacity-40 disabled:hover:bg-[#1E56A0]"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <p className="mt-1 pl-[108px] text-[10px] text-[#5A7190]">
        Shift+Enter for new line · 📎 images, docs, audio · 🎤 voice note
      </p>
    </div>
  );
}
