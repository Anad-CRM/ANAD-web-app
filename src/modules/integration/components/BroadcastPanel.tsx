'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, BarChart3, CheckCircle2, ChevronDown, Filter,
  Loader2, Play, RefreshCw, Send, Users, XCircle, Megaphone,
} from 'lucide-react';
import { Text } from '@/core/components/ui/Text';
import Button from '@/core/components/ui/Button';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import {
  fetchApprovedTemplates,
  createBroadcast,
  sendBroadcast,
  getBroadcastHistory,
  BroadcastTemplate,
  BroadcastRecord,
} from '../api/broadcastApi';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Leads' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Interested', label: 'Interested' },
  { value: 'Not Interested', label: 'Not Interested' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  running: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-orange-100 text-orange-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <AlertCircle className="h-3 w-3" />,
  running: <Loader2 className="h-3 w-3 animate-spin" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

export const BroadcastPanel: React.FC = () => {
  const { showToast } = useFeedback();
  const [tab, setTab] = useState<'create' | 'history'>('create');

  // Create form state
  const [templates, setTemplates] = useState<BroadcastTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BroadcastTemplate | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ─── Load approved templates ────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const data = await fetchApprovedTemplates();
      setTemplates(data);
    } catch {
      showToast('Could not load templates. Check your WhatsApp connection.', 'error');
    } finally {
      setLoadingTemplates(false);
    }
  }, [showToast]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // ─── Load history ────────────────────────────────────────────────
  const loadHistory = useCallback(async (page = 1) => {
    setLoadingHistory(true);
    try {
      const data = await getBroadcastHistory(page);
      setHistory(data.broadcasts);
      setTotalPages(data.pagination.totalPages);
      setHistoryPage(page);
    } catch {
      showToast('Failed to load campaign history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (tab === 'history') loadHistory(1);
  }, [tab, loadHistory]);

  // ─── Create campaign ─────────────────────────────────────────────
  const handleCreate = async () => {
    if (!campaignName.trim()) { showToast('Enter a campaign name', 'error'); return; }
    if (!selectedTemplate) { showToast('Select a template', 'error'); return; }

    setCreating(true);
    try {
      const resp = await createBroadcast({
        campaignName: campaignName.trim(),
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language,
        filterByStatus,
      });

      const broadcastId: string = resp.data?.data?.broadcastId;
      const total: number = resp.data?.data?.totalRecipients || 0;

      showToast(`Campaign created with ${total} recipient(s). Ready to send!`, 'success');
      setLastCreatedId(broadcastId);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e?.response?.data?.error || 'Failed to create campaign', 'error');
    } finally {
      setCreating(false);
    }
  };

  // ─── Send campaign ───────────────────────────────────────────────
  const handleSend = async (broadcastId: string) => {
    if (!confirm('Send this broadcast campaign now? This will message all recipients.')) return;
    setSending(broadcastId);
    try {
      await sendBroadcast(broadcastId);
      showToast('Campaign started! Messages are being sent in the background.', 'success');
      setLastCreatedId(null);
      // Switch to history and reload
      setTab('history');
      setTimeout(() => loadHistory(1), 1500);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      showToast(e?.response?.data?.error || 'Failed to start campaign', 'error');
    } finally {
      setSending(null);
    }
  };

  // ─── Template preview ─────────────────────────────────────────────
  const getTemplatePreview = (template: BroadcastTemplate): string => {
    const body = template.components.find(c => c.type === 'BODY');
    return body?.text || 'No preview available';
  };

  return (
    <div className="rounded-[24px] bg-white shadow-[0_18px_34px_rgba(35,58,120,0.10)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E]">
          <Megaphone className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <Text as="h2" weight="bold" className="text-[#0D1B3E]" style={{ fontSize: '16px' }}>
            Broadcast Campaigns
          </Text>
          <Text size="xs" className="text-[#64748B]">
            Send approved template messages to multiple contacts
          </Text>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['create', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[13px] font-semibold capitalize transition-all border-b-2 ${
              tab === t
                ? 'border-[#0D1B3E] text-[#0D1B3E]'
                : 'border-transparent text-[#94A3B8] hover:text-[#64748B]'
            }`}
          >
            {t === 'create' ? (
              <span className="flex items-center justify-center gap-1.5"><Send className="h-3.5 w-3.5" /> Create</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> History</span>
            )}
          </button>
        ))}
      </div>

      {/* Create Tab */}
      {tab === 'create' && (
        <div className="p-5 space-y-4">
          {/* Campaign Name */}
          <div>
            <Text size="xs" weight="semibold" className="text-[#374151] mb-1.5">Campaign Name</Text>
            <input
              type="text"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="e.g. June Promotion"
              className="w-full rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] text-[#374151] placeholder:text-[#9CA3AF] focus:border-[#0D1B3E] focus:outline-none transition-colors"
            />
          </div>

          {/* Template selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Text size="xs" weight="semibold" className="text-[#374151]">Message Template</Text>
              <button onClick={loadTemplates} className="text-[#64748B] hover:text-[#0D1B3E]">
                <RefreshCw className={`h-3.5 w-3.5 ${loadingTemplates ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingTemplates ? (
              <div className="flex items-center gap-2 rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#64748B]" />
                <Text size="xs" className="text-[#64748B]">Loading templates...</Text>
              </div>
            ) : templates.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center">
                <AlertCircle className="h-5 w-5 text-[#94A3B8] mx-auto mb-1.5" />
                <Text size="xs" className="text-[#64748B]">
                  No approved templates found. Create and get templates approved in your
                  <a href="https://business.facebook.com/wa/manage/message-templates" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
                    WhatsApp Manager
                  </a>.
                </Text>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {templates.map(t => (
                  <label
                    key={t.id}
                    className={`flex cursor-pointer gap-3 rounded-[12px] border-2 p-3 transition-all ${
                      selectedTemplate?.id === t.id
                        ? 'border-[#0D1B3E] bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      className="mt-0.5 accent-[#0D1B3E]"
                      checked={selectedTemplate?.id === t.id}
                      onChange={() => setSelectedTemplate(t)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Text weight="semibold" size="xs" className="text-[#0D1B3E]">{t.name}</Text>
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{t.language}</span>
                        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">{t.category}</span>
                      </div>
                      <Text size="xs" className="text-[#64748B] line-clamp-2">{getTemplatePreview(t)}</Text>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="rounded-[12px] bg-[#DCF8C6] px-4 py-3">
              <Text size="xs" weight="semibold" className="text-[#075E54] mb-1">Preview</Text>
              <Text size="xs" className="text-[#128C7E] whitespace-pre-wrap">{getTemplatePreview(selectedTemplate)}</Text>
            </div>
          )}

          {/* Recipient Filter */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Filter className="h-3.5 w-3.5 text-[#64748B]" />
              <Text size="xs" weight="semibold" className="text-[#374151]">Recipients</Text>
            </div>
            <div className="relative">
              <select
                value={filterByStatus}
                onChange={e => setFilterByStatus(e.target.value)}
                className="w-full appearance-none rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] text-[#374151] focus:border-[#0D1B3E] focus:outline-none pr-8"
              >
                {STATUS_FILTER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={creating || !selectedTemplate || !campaignName.trim()}
              className="flex-1 h-[44px] rounded-[14px] text-[13px] font-bold disabled:opacity-60"
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" /> Create Campaign
                </span>
              )}
            </Button>

            {lastCreatedId && (
              <Button
                variant="primary"
                onClick={() => handleSend(lastCreatedId)}
                disabled={sending === lastCreatedId}
                className="flex-1 h-[44px] rounded-[14px] text-[13px] font-bold disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
              >
                {sending === lastCreatedId ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4" /> Send Now
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Text weight="semibold" className="text-[#0D1B3E]" style={{ fontSize: '14px' }}>
              Campaign History
            </Text>
            <button onClick={() => loadHistory(historyPage)} className="text-[#64748B] hover:text-[#0D1B3E]">
              <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#0D1B3E]" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BarChart3 className="h-10 w-10 text-[#CBD5E1] mb-3" />
              <Text weight="semibold" className="text-[#94A3B8]" size="sm">No campaigns yet</Text>
              <Text size="xs" className="text-[#CBD5E1] mt-1">Create your first broadcast campaign</Text>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(campaign => (
                <div
                  key={campaign.id}
                  className="rounded-[14px] border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Text weight="semibold" size="sm" className="text-[#0D1B3E] truncate">{campaign.campaignName}</Text>
                        <span className={`flex items-center gap-1 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[campaign.status] || STATUS_COLORS.draft}`}>
                          {STATUS_ICONS[campaign.status]}
                          {campaign.status}
                        </span>
                      </div>
                      <Text size="xs" className="text-[#64748B]">
                        Template: <span className="font-medium text-[#374151]">{campaign.templateName}</span>
                      </Text>
                    </div>
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleSend(campaign.id)}
                        disabled={sending === campaign.id}
                        className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-all shadow-md"
                        title="Send campaign"
                      >
                        {sending === campaign.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Stats bar */}
                  <div className="mt-2.5 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-[#94A3B8]" />
                      <Text size="xs" className="text-[#64748B]">{campaign.totalRecipients} total</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <Text size="xs" className="text-green-600">{campaign.sentCount} sent</Text>
                    </div>
                    {campaign.failedCount > 0 && (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-400" />
                        <Text size="xs" className="text-red-500">{campaign.failedCount} failed</Text>
                      </div>
                    )}
                    {campaign.totalRecipients > 0 && campaign.status === 'completed' && (
                      <div className="ml-auto h-1.5 w-20 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${Math.round((campaign.sentCount / campaign.totalRecipients) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <Text size="xs" className="text-[#CBD5E1] mt-1">
                    {new Date(campaign.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    disabled={historyPage <= 1}
                    onClick={() => loadHistory(historyPage - 1)}
                    className="h-7 px-3 rounded-full border border-gray-200 text-[12px] disabled:opacity-40 hover:bg-gray-100"
                  >Prev</button>
                  <Text size="xs" className="text-[#64748B]">{historyPage} / {totalPages}</Text>
                  <button
                    disabled={historyPage >= totalPages}
                    onClick={() => loadHistory(historyPage + 1)}
                    className="h-7 px-3 rounded-full border border-gray-200 text-[12px] disabled:opacity-40 hover:bg-gray-100"
                  >Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
