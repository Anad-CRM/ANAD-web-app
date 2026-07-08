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
    <div className="px-4 py-3">
      {/* Reply quote */}
      {replyTo && (
        <div className="mb-2">
          <ReplyQuote
            authorLabel={replyTo.authorLabel}
            preview={replyTo.preview}
            onDismiss={onClearReply}
          />
        </div>
      )}

      {/* Session-expired banner */}
      {sessionExpired && (
        <div className="mb-2.5 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
            <p className="text-xs font-medium text-amber-700">
              24-hour session expired — use a template to re-engage
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-lg"
            onClick={onOpenTemplates}
          >
            <LayoutTemplate className="mr-1 h-3.5 w-3.5" />
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
        <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shrink-0" />
          <span className="text-xs font-semibold text-red-600">
            Recording… {formatRecordingTime(recordingSeconds)}
          </span>
          <span className="text-[10px] text-red-400 ml-auto">Tap mic to stop & send</span>
        </div>
      )}

      {/* Composer row */}
      <div className="flex items-end gap-2">
        {/* Action buttons */}
        <div className="flex items-center gap-0.5 pb-0.5">
          {/* Templates */}
          <Button
            variant="ghost"
            size="sm"
            title="Insert template"
            className="h-9 w-9 shrink-0 rounded-xl p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            onClick={onOpenTemplates}
            disabled={readOnly || isRecording}
          >
            <LayoutTemplate className="h-4.5 w-4.5" />
          </Button>

          {/* Attachment */}
          <Button
            variant="ghost"
            size="sm"
            title="Attach file"
            className="h-9 w-9 shrink-0 rounded-xl p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            onClick={handleAttachmentClick}
            disabled={readOnly || isRecording || sending}
          >
            <Paperclip className="h-4.5 w-4.5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Text area */}
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
                ? "Read-only"
                : "Message…"
            }
            disabled={readOnly}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all",
              "focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100",
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
              "h-9 w-9 shrink-0 rounded-xl p-0 transition-colors pb-0.5",
              isRecording
                ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            )}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}

        {/* Send button */}
        {(text.trim() || pendingFile) && !isRecording && (
          <Button
            size="sm"
            disabled={readOnly || sending}
            onClick={handleSend}
            className="h-9 w-9 shrink-0 rounded-xl p-0 bg-gradient-to-br from-[#1E56A0] to-[#2563EB] text-white shadow-md hover:shadow-lg hover:from-[#163e78] hover:to-[#1d4ed8] transition-all duration-150 disabled:opacity-50"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <p className="mt-2 pl-2 text-[10px] text-slate-400">
        Enter to send · Shift+Enter for new line · 📎 image, doc, audio · 🎤 voice
      </p>
    </div>
  );
}
