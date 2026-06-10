"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/core/api/axios";
import type { AnadMessageTemplate } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { LayoutTemplate, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the template's message text so the composer can be pre-filled. */
  onSelect: (text: string) => void;
}

export function TemplatePicker({ open, onOpenChange, onSelect }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<AnadMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/whatsapp/getTemplateMessage");
      if (data.success) {
        setTemplates(data.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setShowCreate(false);
    fetchTemplates();
  }, [open, fetchTemplates]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    setCreating(true);
    try {
      await api.post("/whatsapp/createMessageTemplate", {
        title: newTitle.trim(),
        message: newMessage.trim(),
      });
      toast.success("Template created");
      setNewTitle("");
      setNewMessage("");
      setShowCreate(false);
      await fetchTemplates();
    } catch (err) {
      console.error("Failed to create template:", err);
      toast.error("Failed to create template");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/whatsapp/deleteTemplateMessage/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");
    } catch (err) {
      console.error("Failed to delete template:", err);
      toast.error("Failed to delete template");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelect = (template: AnadMessageTemplate) => {
    onSelect(template.message);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-slate-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <LayoutTemplate className="h-4 w-4 text-primary" />
            {showCreate ? "New Template" : "Message Templates"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {showCreate
              ? "Save a new quick-reply template for reuse."
              : "Click a template to pre-fill your message, or create a new one."}
          </DialogDescription>
        </DialogHeader>

        {showCreate ? (
          /* ── Create form ── */
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Follow-up greeting"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Message</Label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type the template message text…"
                rows={5}
                className="w-full resize-none rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-primary/50"
              />
            </div>
          </div>
        ) : (
          /* ── Templates list ── */
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : templates.length === 0 ? (
              <div className="rounded-md border border-slate-800 bg-slate-950/50 p-6 text-center">
                <p className="text-sm text-slate-300">No templates yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Create a template to save commonly used messages for quick re-use.
                </p>
              </div>
            ) : (
              templates.map((t) => (
                <div
                  key={t.id}
                  className="group flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/50 p-3 transition-colors hover:border-primary/40 hover:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(t)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium text-white">{t.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{t.message}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    aria-label="Delete template"
                    className="shrink-0 rounded p-1 text-slate-600 transition-colors hover:text-red-400 disabled:opacity-50"
                  >
                    {deletingId === t.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {showCreate ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                  setNewTitle("");
                  setNewMessage("");
                }}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={creating || !newTitle.trim() || !newMessage.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {creating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                Save Template
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreate(true)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                New Template
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
