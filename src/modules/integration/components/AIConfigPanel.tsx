'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot, Brain, ChevronDown, Eye, EyeOff, Key, Loader2,
  RefreshCw, Send, Sparkles, Trash2, WifiOff, Zap,
} from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import Button from '@/core/components/ui/Button';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import {
  getAiConfig,
  saveAiConfig,
  deleteAiConfig,
  testAiPrompt,
  type AiConfigPayload,
  type AiConfigResponse,
} from '../api/aiApi';

interface Props {
  activeIndex: number;
  total: number;
}

type Provider = 'gemini' | 'openai' | 'none';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const MAX_PROMPT_CHARS = 3000;

const PROVIDER_INFO: Record<Exclude<Provider, 'none'>, { label: string; color: string; hint: string }> = {
  gemini: {
    label: 'Google Gemini',
    color: '#4285F4',
    hint: 'Get your key from Google AI Studio (aistudio.google.com)',
  },
  openai: {
    label: 'OpenAI GPT',
    color: '#10a37f',
    hint: 'Get your key from platform.openai.com → API Keys',
  },
};

export const AIConfigPanel: React.FC<Props> = ({ activeIndex, total }) => {
  const { showToast } = useFeedback();

  // ── Remote state ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Form state ────────────────────────────────────────────────────
  const [provider, setProvider] = useState<Provider>('none');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  // ── Test-prompt state ─────────────────────────────────────────────
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Rounded corners (matching other panels) ───────────────────────
  const roundedClass =
    activeIndex === 0
      ? 'rounded-tr-[28px] rounded-bl-[28px] rounded-br-[28px] rounded-tl-0'
      : activeIndex === total - 1
      ? 'rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-0'
      : 'rounded-[28px]';

  // ── Fetch config on mount ──────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data: AiConfigResponse = await getAiConfig();
      setProvider(data.provider || 'none');
      setApiKey(data.apiKey || '');
      setSystemPrompt(data.systemPrompt || '');
      setIsEnabled(data.isEnabled !== undefined ? data.isEnabled : true);
      setIsConnected(data.provider !== 'none' && (data.hasApiKey || !!data.apiKey));
      setIsDefault(!!data.isDefault);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // ── Save config ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (provider !== 'none' && !apiKey) {
      showToast('Please enter an API key for the selected provider', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: AiConfigPayload = { provider, apiKey, systemPrompt, isEnabled };
      await saveAiConfig(payload);
      setIsConnected(provider !== 'none' && !!apiKey);
      setIsDefault(false);
      showToast('✅ AI configuration saved successfully', 'success');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete / disconnect config ─────────────────────────────────────
  const handleDisconnect = async () => {
    if (!confirm('Disconnect the AI Auto Responder? This will stop AI from replying to messages.')) return;
    setDeleting(true);
    try {
      await deleteAiConfig();
      setProvider('none');
      setApiKey('');
      setSystemPrompt('');
      setIsEnabled(true);
      setIsConnected(false);
      setIsDefault(true);
      showToast('AI configuration disconnected', 'success');
    } catch {
      showToast('Failed to disconnect. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Test prompt ────────────────────────────────────────────────────
  const handleTestSend = async () => {
    if (!testInput.trim()) return;

    const userMsg = testInput.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setTestInput('');
    setTestLoading(true);

    try {
      const overrides = provider !== 'none' && apiKey && !apiKey.startsWith('••••')
        ? { provider, apiKey, systemPrompt }
        : undefined;

      const reply = await testAiPrompt(userMsg, chatHistory, overrides);
      setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || 'AI request failed';
      setChatHistory(prev => [...prev, { role: 'ai', text: `⚠️ ${msg}` }]);
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTestSend();
    }
  };

  const clearChat = () => setChatHistory([]);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div
      className={`flex h-full w-full flex-col gap-4 p-4 shadow-[0_18px_34px_rgba(35,58,120,0.18)] lg:p-5 xl:pl-[40px] animate-slide-up-fade ${roundedClass}`}
      style={{
        backgroundColor: COLORS.primary,
        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="rounded-[24px] bg-[#E2E8F0] px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_18px_rgba(35,58,120,0.25)]"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
          >
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <Text as="h2" weight="bold" style={{ fontSize: '17px', lineHeight: '1.25' }} className="text-[#0D1B3E]">
              AI Auto Responder
            </Text>
            <Text className="text-[#64748B]" size="xs" weight="medium">
              Configure AI to auto-reply to WhatsApp leads
            </Text>
          </div>

          <div className="flex items-center gap-2">
            {/* Enable / Disable toggle */}
            <button
              onClick={() => setIsEnabled(v => !v)}
              title={isEnabled ? 'Disable AI Responder' : 'Enable AI Responder'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-violet-600' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>

            {/* Refresh */}
            <button
              onClick={fetchConfig}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748B] hover:bg-white/50 transition-all"
              title="Refresh config"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
              isConnected
                ? 'bg-violet-100 text-violet-700'
                : 'bg-[#F1F5F9] text-[#94A3B8]'
            }`}
          >
            {isConnected ? (
              <>
                <Zap className="h-3 w-3" />
                Active
                {isDefault && ' (env default)'}
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Not configured
              </>
            )}
          </span>

          {isEnabled && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">
              <Sparkles className="h-3 w-3" />
              Enabled
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-[22px] bg-[#E2E8F0] px-4 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
          <Text size="sm" className="ml-2 text-[#64748B]">Loading configuration...</Text>
        </div>
      ) : (
        <>
          {/* ── Provider selector ─────────────────────────────────── */}
          <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <Text size="xs" weight="semibold" className="text-[#0D1B3E] mb-3 ml-1 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              AI Provider
            </Text>

            <div className="grid grid-cols-3 gap-2">
              {(['none', 'gemini', 'openai'] as Provider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`rounded-[14px] px-3 py-2.5 text-[12px] font-semibold transition-all border-2 ${
                    provider === p
                      ? 'border-violet-500 bg-white text-violet-700 shadow-[0_4px_12px_rgba(124,58,237,0.18)]'
                      : 'border-transparent bg-white/60 text-[#64748B] hover:bg-white hover:text-[#0D1B3E]'
                  }`}
                >
                  {p === 'none' ? '🚫 None' : p === 'gemini' ? '✨ Gemini' : '🤖 OpenAI'}
                </button>
              ))}
            </div>

            {provider !== 'none' && (
              <p className="mt-2 ml-1 text-[11px] text-[#94A3B8]">
                {PROVIDER_INFO[provider].hint}
              </p>
            )}
          </div>

          {/* ── API Key input ─────────────────────────────────────── */}
          {provider !== 'none' && (
            <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              <Text size="xs" weight="semibold" className="text-[#0D1B3E] mb-2 ml-1 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                {PROVIDER_INFO[provider].label} API Key
              </Text>
              <div className="relative rounded-[14px] bg-white border border-transparent focus-within:border-violet-300 transition-all">
                <input
                  id="ai-api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Paste your API key here…"
                  className="w-full bg-transparent px-4 py-3 pr-11 text-[13px] text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* ── System Prompt editor ──────────────────────────────── */}
          <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between mb-2 ml-1">
              <Text size="xs" weight="semibold" className="text-[#0D1B3E] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                System Prompt
              </Text>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium ${systemPrompt.length > MAX_PROMPT_CHARS ? 'text-red-500' : 'text-[#94A3B8]'}`}>
                  {systemPrompt.length}/{MAX_PROMPT_CHARS}
                </span>
                {systemPrompt && (
                  <button
                    onClick={() => setSystemPrompt('')}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Clear prompt"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[14px] bg-white border border-transparent focus-within:border-violet-300 transition-all">
              <textarea
                id="ai-system-prompt"
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                rows={8}
                maxLength={MAX_PROMPT_CHARS}
                placeholder={`Describe how the AI should behave…\n\nExample:\nYou are Aishwarya, a friendly admission counselor. Ask one question at a time and guide students through course selection.`}
                className="w-full resize-none bg-transparent px-4 py-3 text-[13px] text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none leading-relaxed"
              />
            </div>

            <p className="mt-2 ml-1 text-[11px] text-[#94A3B8]">
              This prompt defines the AI&apos;s personality and goals. Use clear instructions for best results.
            </p>
          </div>

          {/* ── Action buttons ─────────────────────────────────────── */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || systemPrompt.length > MAX_PROMPT_CHARS}
              className="flex-1 h-[44px] rounded-full text-[14px] font-bold transition-all disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving…</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Save Configuration</span>
                </div>
              )}
            </Button>

            {isConnected && (
              <button
                onClick={handleDisconnect}
                disabled={deleting}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-all disabled:opacity-50 flex-shrink-0"
                title="Disconnect AI"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* ── Test Prompt section ───────────────────────────────── */}
          <div className="rounded-[22px] bg-[#E2E8F0] shadow-[0_4px_12px_rgba(15,23,42,0.06)] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTestPanel(v => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-[#64748B]" />
                <Text size="xs" weight="semibold" className="text-[#64748B]">
                  Test Prompt — Live Preview
                </Text>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-[#64748B] transition-transform ${showTestPanel ? 'rotate-180' : ''}`}
              />
            </button>

            {showTestPanel && (
              <div className="border-t border-[#CBD5E1]">
                {/* Chat messages */}
                <div className="flex flex-col gap-2 px-4 py-3 max-h-[260px] overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <Bot className="h-8 w-8 text-violet-300" />
                      <Text size="xs" className="text-[#94A3B8]">
                        Type a message to test how your AI will respond
                      </Text>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-[14px] px-3 py-2 text-[12px] leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-violet-600 text-white rounded-br-[4px]'
                              : 'bg-white text-[#374151] shadow-sm rounded-bl-[4px]'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}

                  {testLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-[14px] rounded-bl-[4px] bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <div className="flex items-center gap-2 border-t border-[#CBD5E1] px-3 py-3">
                  <input
                    id="ai-test-input"
                    type="text"
                    value={testInput}
                    onChange={e => setTestInput(e.target.value)}
                    onKeyDown={handleTestKeyDown}
                    placeholder="Type a test message…"
                    disabled={testLoading}
                    className="flex-1 rounded-[12px] bg-white px-3 py-2 text-[12px] text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50"
                  />
                  <button
                    onClick={handleTestSend}
                    disabled={testLoading || !testInput.trim()}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white transition-all hover:bg-violet-700 disabled:opacity-50"
                  >
                    {testLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {chatHistory.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-[#94A3B8] hover:bg-[#CBD5E1] transition-all"
                      title="Clear chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="px-4 pb-3 text-[10px] text-[#94A3B8]">
                  ⚡ This uses the saved (or current form) API key and system prompt. Results reflect live AI behavior.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
