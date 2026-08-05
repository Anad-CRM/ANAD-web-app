"use client";

import React, { useEffect, useState } from "react";
import {
  Zap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MessageCircle,
  Clock,
  Info,
  Sparkles,
  Instagram,
  X,
  Share2,
  Calendar,
  Filter,
  UserX,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Music,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { COLORS } from "@/core/components/theme/colors";
import {
  TemplateMessage,
  getTemplateMessages,
  createTemplateMessage,
  updateTemplateMessage,
  deleteTemplateMessage,
  CreateTemplatePayload,
} from "@/core/api/templateApi";

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

interface PresetTemplate {
  name: string;
  description: string;
  ruleType: 'keyword' | 'scheduled';
  channel: 'all' | 'whatsapp' | 'instagram';
  trigger: string;
  reply: string;
  delayHours?: number;
  mediaUrl?: string;
  icon: React.ReactNode;
}

function formatDelay(h?: number, m?: number, s?: number): string {
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || (!h && !m)) parts.push(`${s || 0}s`);
  return parts.join(" ");
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<TemplateMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TemplateMessage | null>(null);

  // Form fields
  const [ruleType, setRuleType] = useState<'keyword' | 'scheduled'>('keyword');
  const [channel, setChannel] = useState<'all' | 'whatsapp' | 'instagram'>('all');
  const [trigger, setTrigger] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [delayHours, setDelayHours] = useState<number>(22);
  const [delayMinutes, setDelayMinutes] = useState<number>(0);
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video' | 'audio' | 'document'>('text');
  const [targetAudience, setTargetAudience] = useState<'everyone' | 'selected'>('everyone');
  const [excludeInput, setExcludeInput] = useState("");
  const [excludeChatIds, setExcludeChatIds] = useState<string[]>([]);
  const [maxExecutionCount, setMaxExecutionCount] = useState<number>(1);
  const [intervalHours, setIntervalHours] = useState<number>(0);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(0);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(0);
  const [triggerAfterAiComplete, setTriggerAfterAiComplete] = useState<boolean>(false);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRules = async () => {
    try {
      const data = await getTemplateMessages();
      setRules(data);
    } catch {
      toast.error("Failed to load automation rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const persistToggle = async (rule: TemplateMessage, val: boolean) => {
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: val } : r));
    try {
      await updateTemplateMessage(rule.id, { ...rule, isActive: val });
      toast.success(val ? "Automation rule enabled" : "Automation rule disabled");
    } catch {
      toast.error("Failed to update rule status");
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !val } : r));
    }
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setRuleType('keyword');
    setChannel('all');
    setTrigger('');
    setReplyMessage('');
    setDelayHours(22);
    setDelayMinutes(0);
    setDelaySeconds(0);
    setIntervalHours(0);
    setIntervalMinutes(0);
    setIntervalSeconds(0);
    setMediaUrl('');
    setMediaType('text');
    setTargetAudience('everyone');
    setExcludeInput('');
    setExcludeChatIds([]);
    setMaxExecutionCount(1);
    setTriggerAfterAiComplete(false);
    setModalOpen(true);
  };

  const openEditModal = (rule: TemplateMessage) => {
    setEditingRule(rule);
    setRuleType(rule.ruleType || 'keyword');
    setChannel(rule.channel || 'all');
    setTrigger(rule.title || '');
    setReplyMessage(rule.message || '');
    setDelayHours(rule.delayHours ?? 22);
    setDelayMinutes(rule.delayMinutes ?? 0);
    setDelaySeconds(rule.delaySeconds ?? 0);
    setIntervalHours(rule.intervalHours ?? 0);
    setIntervalMinutes(rule.intervalMinutes ?? 0);
    setIntervalSeconds(rule.intervalSeconds ?? 0);
    setMediaUrl(rule.mediaUrl || '');
    setMediaType((rule.mediaType as 'text' | 'image' | 'video' | 'audio' | 'document') || (rule.mediaUrl ? 'image' : 'text'));
    setTargetAudience(rule.targetAudience || 'everyone');
    setExcludeInput('');
    setExcludeChatIds(Array.isArray(rule.excludeChatIds) ? rule.excludeChatIds : []);
    setMaxExecutionCount(rule.maxExecutionCount ?? 1);
    setTriggerAfterAiComplete(Boolean(rule.triggerAfterAiComplete));
    setModalOpen(true);
  };

  const handleUsePreset = (preset: PresetTemplate) => {
    setEditingRule(null);
    setRuleType(preset.ruleType);
    setChannel(preset.channel);
    setTrigger(preset.trigger);
    setReplyMessage(preset.reply);
    setDelayHours(preset.delayHours ?? 22);
    setDelayMinutes(0);
    setDelaySeconds(0);
    setIntervalHours(0);
    setIntervalMinutes(0);
    setIntervalSeconds(0);
    setMediaUrl(preset.mediaUrl || '');
    setMediaType(preset.mediaUrl ? 'image' : 'text');
    setTargetAudience('everyone');
    setExcludeInput('');
    setExcludeChatIds([]);
    setMaxExecutionCount(1);
    setTriggerAfterAiComplete(false);
    setModalOpen(true);
  };

  const addExcludeItem = () => {
    if (!excludeInput.trim()) return;
    const clean = excludeInput.trim();
    if (!excludeChatIds.includes(clean)) {
      setExcludeChatIds([...excludeChatIds, clean]);
    }
    setExcludeInput("");
  };

  const removeExcludeItem = (item: string) => {
    setExcludeChatIds(excludeChatIds.filter(x => x !== item));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trigger.trim() || !replyMessage.trim()) {
      toast.error("Please fill in both name/trigger and message content");
      return;
    }

    setSaving(true);
    const payload: CreateTemplatePayload = {
      title: trigger.trim(),
      message: replyMessage.trim(),
      ruleType,
      channel,
      delayHours: Number(delayHours) || 0,
      delayMinutes: Number(delayMinutes) || 0,
      delaySeconds: Number(delaySeconds) || 0,
      mediaUrl: mediaUrl.trim() || null,
      mediaType: mediaUrl.trim() ? mediaType : 'text',
      targetAudience,
      excludeChatIds,
      maxExecutionCount: Number(maxExecutionCount) >= 0 ? Number(maxExecutionCount) : 1,
      intervalHours: Number(intervalHours) || 0,
      intervalMinutes: Number(intervalMinutes) || 0,
      intervalSeconds: Number(intervalSeconds) || 0,
      triggerAfterAiComplete,
    };

    try {
      if (editingRule) {
        await updateTemplateMessage(editingRule.id, payload);
        toast.success("Automation rule updated!");
      } else {
        await createTemplateMessage(payload);
        toast.success("Automation rule created!");
      }
      setModalOpen(false);
      loadRules();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save rule";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTemplateMessage(id);
      toast.success("Automation rule deleted");
      loadRules();
    } catch {
      toast.error("Failed to delete automation rule");
    } finally {
      setDeletingId(null);
    }
  };

  const presets: PresetTemplate[] = [
    {
      name: "22-Hour Reel & Follow-up (24h Compliance)",
      description: "Auto-send Instagram Reel/Link 22 hrs after contact (before 24h Meta window closes)",
      ruleType: "scheduled",
      channel: "all",
      trigger: "22-Hour Reel Promo",
      reply: "Hey! Check out our latest Reel and special offer: https://instagram.com/reel/example 🔥",
      delayHours: 22,
      mediaUrl: "https://instagram.com/reel/example",
      icon: <Share2 className="h-5 w-5 text-pink-500" />,
    },
    {
      name: "Welcome greeting",
      description: "Send friendly intro when lead says hello",
      ruleType: "keyword",
      channel: "all",
      trigger: "hello, hi, hey, greetings",
      reply: "Hi there! 👋 Thanks for contacting ANAD. How can we help you today?",
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
    },
    {
      name: "Out of Office",
      description: "Auto-reply when messages arrive offline",
      ruleType: "keyword",
      channel: "all",
      trigger: "away, offline, closed",
      reply: "Hello! We are currently offline. Working hours are Mon-Fri, 9am-6pm. We will reply ASAP!",
      icon: <Clock className="h-5 w-5 text-amber-500" />,
    },
    {
      name: "Price inquiry",
      description: "Quick quote or price list trigger",
      ruleType: "keyword",
      channel: "all",
      trigger: "price, cost, rates, package",
      reply: "Thanks for inquiring! 🌟 Here are our standard packages: https://anad.ae/pricing",
      icon: <Info className="h-5 w-5 text-emerald-500" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
            Automations & Scheduled Messages
          </h1>
          <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
            Set up keyword auto-replies or exact scheduled-time follow-up messages (with auto-cancel on reply) for Instagram & WhatsApp.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 mt-3 sm:mt-0"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Plus className="h-4 w-4" />
          Create Automation
        </button>
      </div>

      {/* Quick Start Presets Section */}
      <section className="mt-2">
        <h2 className="text-xs font-bold mb-3 uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Quick-Start Recipes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleUsePreset(preset)}
              className="flex flex-col items-start text-left rounded-2xl border p-4 transition-all hover:bg-slate-50/80 hover:shadow-md bg-white group"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl mb-3 transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${COLORS.primary}12` }}
              >
                {preset.icon}
              </div>
              <p className="text-sm font-bold text-slate-900">
                {preset.name}
              </p>
              <p className="text-xs mt-1 text-slate-500 leading-normal line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Rules List */}
      <section className="mt-2">
        <h2 className="text-xs font-bold mb-3 uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />
          My Automation & Scheduled Rules
        </h2>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rules.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
            <Zap className="h-8 w-8 mb-3 text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">
              No automation rules configured yet
            </p>
            <p className="text-xs mt-1 mb-4 text-slate-500">
              Create your first rule above or click a recipe preset to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {rules.map((rule) => {
              const isActive = rule.isActive !== false;
              const isScheduled = rule.ruleType === "scheduled";
              const isIg = rule.channel === "instagram";
              const isWa = rule.channel === "whatsapp";

              return (
                <div
                  key={rule.id}
                  className="flex flex-col gap-4 rounded-2xl border p-5 bg-white shadow-sm sm:flex-row sm:items-center sm:justify-between transition-all hover:shadow-md"
                  style={{ borderColor: COLORS.border }}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl mt-0.5"
                      style={{
                        backgroundColor: isActive
                          ? isScheduled
                            ? "#FDF2F8"
                            : `${COLORS.primary}12`
                          : "#F1F5F9",
                        color: isActive
                          ? isScheduled
                            ? "#DB2777"
                            : COLORS.primary
                          : "#94A3B8",
                      }}
                    >
                      {isScheduled ? <Calendar className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {rule.title}
                        </span>

                        {/* Rule type badge */}
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isScheduled
                            ? "bg-pink-100 text-pink-700 border border-pink-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}>
                          {isScheduled ? `Scheduled (${formatDelay(rule.delayHours, rule.delayMinutes, rule.delaySeconds)} Delay)` : "Keyword Trigger"}
                        </span>

                        {isScheduled && (
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Limit: {rule.maxExecutionCount === 0 ? "Unlimited" : `${rule.maxExecutionCount ?? 1}x per chat`}
                          </span>
                        )}

                        {isScheduled && (rule.intervalHours || rule.intervalMinutes || rule.intervalSeconds) ? (
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Repeat Every: {formatDelay(rule.intervalHours, rule.intervalMinutes, rule.intervalSeconds)}
                          </span>
                        ) : null}

                        {isScheduled && rule.triggerAfterAiComplete ? (
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-indigo-500" />
                            After AI Chat
                          </span>
                        ) : null}

                        {/* Channel Badge */}
                        <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {isIg && <Instagram className="h-3 w-3 text-pink-500" />}
                          {isWa && <WhatsAppIcon className="h-3 w-3 text-emerald-500" />}
                          {!isIg && !isWa && (
                            <>
                              <Instagram className="h-3 w-3 text-pink-500" />
                              <WhatsAppIcon className="h-3 w-3 text-emerald-500" />
                            </>
                          )}
                          {isIg ? "Instagram" : isWa ? "WhatsApp" : "All Channels"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {rule.message}
                      </p>

                      {/* Media URL badge if exists */}
                      {rule.mediaUrl && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50/70 border border-blue-100 px-2.5 py-1 rounded-lg w-fit">
                          {rule.mediaType === 'image' && <ImageIcon className="h-3.5 w-3.5 text-blue-600" />}
                          {rule.mediaType === 'video' && <Video className="h-3.5 w-3.5 text-blue-600" />}
                          {rule.mediaType === 'audio' && <Music className="h-3.5 w-3.5 text-blue-600" />}
                          {rule.mediaType === 'document' && <FileText className="h-3.5 w-3.5 text-blue-600" />}
                          {(!rule.mediaType || rule.mediaType === 'text') && <LinkIcon className="h-3.5 w-3.5 text-blue-600" />}
                          <span className="capitalize font-bold text-[11px] text-blue-800">{rule.mediaType || 'Link'}:</span>
                          <a href={rule.mediaUrl} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-xs">
                            {rule.mediaUrl}
                          </a>
                        </div>
                      )}

                      {/* Excluded contacts badge */}
                      {Array.isArray(rule.excludeChatIds) && rule.excludeChatIds.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <UserX className="h-3 w-3 text-red-400" />
                          Excluded ({rule.excludeChatIds.length}): {rule.excludeChatIds.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 border-t pt-3 sm:border-t-0 sm:pt-0 border-slate-100">
                    {/* Active toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-slate-500">
                        {isActive ? "Enabled" : "Disabled"}
                      </span>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => persistToggle(rule, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>

                    {/* Edit/Delete actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(rule)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit rule"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        disabled={deletingId === rule.id}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete rule"
                      >
                        {deletingId === rule.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Create / Edit Automation Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: "rgba(13,27,62,0.45)", backdropFilter: "blur(4px)" }}
        >
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingRule ? "Edit Automation Rule" : "Create Automation Rule"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure trigger, scheduled time, channel and media payload
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Rule Type Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Automation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRuleType('keyword')}
                    className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition-all ${ruleType === 'keyword'
                        ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Zap className="h-4 w-4" />
                    Keyword Trigger
                  </button>

                  <button
                    type="button"
                    onClick={() => setRuleType('scheduled')}
                    className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition-all ${ruleType === 'scheduled'
                        ? 'border-pink-500 bg-pink-50/50 text-pink-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Calendar className="h-4 w-4" />
                    Scheduled Follow-up (24h)
                  </button>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Target Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('all')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 border text-xs font-bold transition-all ${channel === 'all'
                        ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    All Channels
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('instagram')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 border text-xs font-bold transition-all ${channel === 'instagram'
                        ? 'border-pink-500 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    style={channel === 'instagram' ? { background: COLORS.instagram_gradient } : undefined}
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    Instagram
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 border text-xs font-bold transition-all ${channel === 'whatsapp'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Title / Trigger Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {ruleType === 'keyword' ? 'Trigger Keyword(s)' : 'Automation Rule Name'}
                </label>
                <input
                  type="text"
                  placeholder={ruleType === 'keyword' ? "e.g. price, package (comma separated)" : "e.g. 22-Hour Reel Promo Follow-up"}
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">
                  {ruleType === 'keyword'
                    ? "Fires auto-reply when an incoming message matches these keywords."
                    : "Label to identify this scheduled campaign rule."}
                </span>
              </div>

              {/* Scheduled Delay Settings (if scheduled rule) */}
              {ruleType === 'scheduled' && (
                <div className="flex flex-col gap-2.5 rounded-2xl bg-pink-50/60 p-3.5 border border-pink-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-pink-600" />
                      Delay After Customer Message
                    </label>
                    <span className="text-xs font-bold text-pink-700 bg-pink-200/60 px-2.5 py-0.5 rounded-full font-mono">
                      {formatDelay(delayHours, delayMinutes, delaySeconds)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-pink-800">Hours</span>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={delayHours}
                        onChange={(e) => setDelayHours(Math.max(0, Number(e.target.value)))}
                        className="rounded-xl border border-pink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-500 font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-pink-800">Minutes</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={delayMinutes}
                        onChange={(e) => setDelayMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                        className="rounded-xl border border-pink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-500 font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-pink-800">Seconds</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={delaySeconds}
                        onChange={(e) => setDelaySeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                        className="rounded-xl border border-pink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Repeat Count / Execution limit */}
                  <div className="flex items-center justify-between border-t border-pink-200/60 pt-2.5 mt-1">
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-pink-900">
                        Max Times Per Chat
                      </label>
                      <span className="text-[10px] text-pink-700">
                        How many times this rule can run for the same chat (1 = once, 0 = unlimited).
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={maxExecutionCount}
                      onChange={(e) => setMaxExecutionCount(Math.max(0, Number(e.target.value)))}
                      className="w-20 rounded-xl border border-pink-200 px-3 py-1.5 text-sm bg-white text-center font-bold text-pink-900 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  {/* Repeat Interval (if maxExecutionCount > 1 or 0) */}
                  {(maxExecutionCount > 1 || maxExecutionCount === 0) && (
                    <div className="flex flex-col gap-2 border-t border-pink-200/60 pt-2.5 mt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-pink-600" />
                          Repeat Interval Between Executions
                        </label>
                        <span className="text-xs font-bold text-pink-700 bg-pink-200/60 px-2.5 py-0.5 rounded-full font-mono">
                          {formatDelay(intervalHours, intervalMinutes, intervalSeconds)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-pink-800">Hours</span>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={intervalHours}
                            onChange={(e) => setIntervalHours(Math.max(0, Number(e.target.value)))}
                            className="rounded-xl border border-pink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-500 font-medium"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-pink-800">Minutes</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={intervalMinutes}
                            onChange={(e) => setIntervalMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                            className="rounded-xl border border-pink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-500 font-medium"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-pink-800">Seconds</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={intervalSeconds}
                            onChange={(e) => setIntervalSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                            className="rounded-xl border border-pink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trigger After AI Complete Toggle */}
                  <div className="flex items-center justify-between border-t border-pink-200/60 pt-2.5 mt-1">
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                        Send Only After AI Conversation Completes
                      </label>
                      <span className="text-[10px] text-pink-700">
                        If AI Auto-Reply is active on a chat, wait until the AI conversation finishes before sending.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTriggerAfterAiComplete(!triggerAfterAiComplete)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        triggerAfterAiComplete ? "bg-purple-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          triggerAfterAiComplete ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-[11px] text-pink-700 leading-tight">
                    <strong>Exact Scheduled Execution:</strong> Message triggers at this exact delay after a customer message, and automatically cancels if an agent or bot replies in the interim! (Meta 24-hr policy applies to Instagram).
                  </p>
                </div>
              )}

              {/* Message Content Textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Message Content & Description</label>
                <textarea
                  rows={3}
                  placeholder="Type your automated response, description or link message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Media Type & Payload Attachment */}
              <div className="flex flex-col gap-2 rounded-2xl bg-blue-50/50 p-3.5 border border-blue-100">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
                  Media Attachment & Payload (Optional)
                </label>

                {/* Media Type Selector */}
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMediaType('text')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[10px] font-bold transition-all ${mediaType === 'text'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5 mb-0.5" />
                    Link / Reel
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[10px] font-bold transition-all ${mediaType === 'image'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5 mb-0.5" />
                    Image
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[10px] font-bold transition-all ${mediaType === 'video'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Video className="h-3.5 w-3.5 mb-0.5" />
                    Video
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('audio')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[10px] font-bold transition-all ${mediaType === 'audio'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Music className="h-3.5 w-3.5 mb-0.5" />
                    Audio
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaType('document')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[10px] font-bold transition-all ${mediaType === 'document'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <FileText className="h-3.5 w-3.5 mb-0.5" />
                    Document
                  </button>
                </div>

                {/* Media URL Input */}
                <input
                  type="text"
                  placeholder={
                    mediaType === 'image' ? "Enter image URL (PNG, JPG)..." :
                      mediaType === 'video' ? "Enter video or Instagram Reel URL (MP4)..." :
                        mediaType === 'audio' ? "Enter audio URL (MP3, AAC)..." :
                          mediaType === 'document' ? "Enter document URL (PDF, DOCX)..." :
                            "e.g. https://instagram.com/reel/... or media URL"
                  }
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* Audience Exclusions */}
              <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-600" />
                  Exclude Specific Contacts / Chat IDs (Exceptions)
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter phone number or Instagram user ID..."
                    value={excludeInput}
                    onChange={(e) => setExcludeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExcludeItem(); } }}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addExcludeItem}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
                  >
                    Add Exception
                  </button>
                </div>

                {excludeChatIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {excludeChatIds.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-100 text-red-700 px-2.5 py-1 text-xs font-semibold"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeExcludeItem(item)}
                          className="text-red-500 hover:text-red-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingRule ? "Save Changes" : "Create Automation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
