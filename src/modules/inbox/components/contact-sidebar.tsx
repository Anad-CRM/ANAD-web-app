"use client";

import { useState, useEffect, useCallback } from "react";
import { cn, createClient } from "../lib/utils";
import type { Contact, Deal, ContactNote, Tag } from "../types";
import {
  Phone,
  Mail,
  Copy,
  Check,
  User,
  Tag as TagIcon,
  DollarSign,
  StickyNote,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { format } from "date-fns";

interface ContactSidebarProps {
  contact: Contact | null;
}

export function ContactSidebar({ contact }: ContactSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [tags, setTags] = useState<(Tag & { contact_tag_id: string })[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const fetchContactData = useCallback(async () => {
    if (!contact) return;

    const supabase = createClient();

    // Fetch deals, notes, and tags in parallel
    const [dealsRes, notesRes, tagsRes] = await Promise.all([
      supabase
        .from("deals")
        .select("*, stage:pipeline_stages(*)")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_notes")
        .select("*")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_tags")
        .select("id, tag_id, tags(*)")
        .eq("contact_id", contact.id),
    ]);

    if (dealsRes.data) setDeals(dealsRes.data);
    if (notesRes.data) setNotes(notesRes.data);
    if (tagsRes.data) {
      const mapped = tagsRes.data
        .filter((ct: Record<string, unknown>) => ct.tags)
        .map((ct: Record<string, unknown>) => ({
          ...(ct.tags as Tag),
          contact_tag_id: ct.id as string,
        }));
      setTags(mapped);
    }
  }, [contact]);

  // Load on contact change. setContactData/setTags run inside async
  // Supabase callbacks, not synchronously in the effect body.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContactData();
  }, [fetchContactData]);

  const handleCopyPhone = useCallback(async () => {
    if (!contact?.phone && !contact?.phone_number) return;
    const phoneToCopy = contact.phone || contact.phone_number;
    await navigator.clipboard.writeText(phoneToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [contact]);

  const handleAddNote = useCallback(async () => {
    if (!contact || !newNote.trim()) return;
    setAddingNote(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    const { data, error } = await supabase
      .from("contact_notes")
      .insert({
        contact_id: contact.id,
        user_id: user?.id,
        note_text: newNote.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setNotes((prev) => [data, ...prev]);
      setNewNote("");
    }
    setAddingNote(false);
  }, [contact, newNote]);

  if (!contact) {
    return (
      <div className="flex h-full w-70 items-center justify-center border-l border-[#D6E4F0] bg-[#F6F6F6]">
        <p className="text-sm text-[#5A7190] font-medium">Select a conversation</p>
      </div>
    );
  }

  const displayName = contact.name || contact.phone || contact.phone_number || "";
  const initials = displayName ? displayName.charAt(0).toUpperCase() : "?";

  return (
    <div className="flex h-full w-70 flex-col border-l border-[#D6E4F0] bg-[#F6F6F6]">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Contact Info */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E56A0] text-lg font-semibold text-white shadow-sm">
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
                  alt={displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#0D1B3E]">
              {displayName}
            </h3>
            {contact.company && (
              <p className="text-xs text-[#5A7190]">{contact.company}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mt-4 space-y-2">
            <button
              onClick={handleCopyPhone}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#0D1B3E] transition-colors hover:bg-[#EEF4FB]"
            >
              <Phone className="h-4 w-4 text-[#5A7190]" />
              <span className="flex-1 text-left">{contact.phone || contact.phone_number}</span>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#1E56A0]" />
              ) : (
                <Copy className="h-3 w-3 text-[#8BA5C0]" />
              )}
            </button>

            {contact.email && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#0D1B3E]">
                <Mail className="h-4 w-4 text-[#5A7190]" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-[#D6E4F0]" />

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-[#5A7190]">
              <TagIcon className="h-3 w-3" />
              Tags
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.length === 0 ? (
                <p className="px-1 text-xs text-[#8BA5C0]">No tags</p>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag.contact_tag_id}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm border border-[#D6E4F0]"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                      borderColor: `${tag.color}30`,
                    }}
                  >
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-[#D6E4F0]" />

          {/* Active Deals */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-[#5A7190]">
              <DollarSign className="h-3 w-3" />
              Active Deals
            </div>
            <div className="mt-2 space-y-2">
              {deals.length === 0 ? (
                <p className="px-1 text-xs text-[#8BA5C0]">No deals</p>
              ) : (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-lg bg-white border border-[#D6E4F0] px-3 py-2 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-[#0D1B3E]">
                      {deal.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-[#5A7190]">
                      <span className="font-medium">
                        {deal.currency ?? "$"}
                        {deal.value.toLocaleString()}
                      </span>
                      {deal.stage && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] border border-[#D6E4F0]"
                          style={{
                            backgroundColor: `${deal.stage.color}15`,
                            color: deal.stage.color,
                            borderColor: `${deal.stage.color}30`,
                          }}
                        >
                          {deal.stage.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-[#D6E4F0]" />

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-[#5A7190]">
              <StickyNote className="h-3 w-3" />
              Notes
            </div>
            <div className="mt-2">
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-[#D6E4F0] bg-white px-3 py-2 text-xs text-[#0D1B3E] placeholder-slate-400 outline-none focus:border-[#1E56A0]"
                />
                <Button
                  size="sm"
                  className="h-auto bg-[#1E56A0] text-white px-2 hover:bg-[#163172] rounded-lg"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-white border border-[#D6E4F0] px-3 py-2 shadow-sm"
                  >
                    <p className="whitespace-pre-wrap text-xs text-[#0D1B3E]">
                      {note.note_text}
                    </p>
                    <p className="mt-1 text-[9px] text-[#8BA5C0] font-medium">
                      {format(new Date(note.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
