'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2, ChevronDown, ExternalLink, Key, Loader2,
  RefreshCw, Trash2, Wifi, WifiOff, Instagram, Sparkles, Zap,
} from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import Button from '@/core/components/ui/Button';
import {
  getConnectedInstagramAccounts,
  connectInstagramIntegration,
  disconnectInstagramAccount,
  lookupInstagramPage,
} from '../api/instagramApi';
import { getAiConfig, saveAiConfig, type AiConfigResponse } from '../api/aiApi';
import type { FBLoginResponse } from '../types/facebook';
import { useFeedback } from '@/core/contexts/FeedbackContext';

interface Props {
  activeIndex: number;
  total: number;
}

interface ConnectedAccount {
  id: string;
  pageId: string;
  igUserId: string;
  igUsername: string | null;
  status: string;
  isActive: boolean;
  lastConnectedAt: string;
}

const IG_PERMISSIONS = [
  'instagram_basic',
  'instagram_manage_messages',
  'instagram_content_publish',
  'pages_messaging',
  'pages_read_engagement',
  'pages_manage_metadata',
  'pages_show_list',
  'business_management',
];

const HELP_TOPICS = [
  { label: 'Instagram Messaging API overview', href: 'https://developers.facebook.com/docs/messenger-platform/instagram' },
  { label: 'Required permissions & app review', href: 'https://developers.facebook.com/docs/permissions' },
  { label: 'Instagram 24-hour reply window', href: 'https://developers.facebook.com/docs/messenger-platform/instagram/features/customer-chat' },
  { label: 'Connect a Facebook Page to Instagram', href: 'https://help.instagram.com/399237934150902' },
];

export const InstagramConfigPanel: React.FC<Props> = ({ activeIndex, total }) => {
  const { showToast } = useFeedback();

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  // Manual fallback state
  const [manualPageId, setManualPageId] = useState('');
  const [manualIgUserId, setManualIgUserId] = useState('');
  const [manualIgUsername, setManualIgUsername] = useState('');
  const [manualToken, setManualToken] = useState('');

  // AI Config state
  const [aiConfig, setAiConfig] = useState<AiConfigResponse | null>(null);
  const [savingAi, setSavingAi] = useState(false);
  const [igSystemPrompt, setIgSystemPrompt] = useState('');
  const [askContactNumber, setAskContactNumber] = useState(true);
  const [useCustomIgPrompt, setUseCustomIgPrompt] = useState(false);

  const fetchAiConfig = useCallback(async () => {
    try {
      const data = await getAiConfig();
      setAiConfig(data);
      setIgSystemPrompt(data.instagramSystemPrompt || '');
      setAskContactNumber(data.askContactNumber !== false);
      setUseCustomIgPrompt(!!data.instagramSystemPrompt && data.instagramSystemPrompt !== data.systemPrompt);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { fetchAiConfig(); }, [fetchAiConfig]);

  const handleSaveAi = async () => {
    if (!aiConfig) return;
    setSavingAi(true);
    try {
      await saveAiConfig({
        provider: aiConfig.provider,
        model: aiConfig.model || null,
        apiKey: aiConfig.apiKey || '',
        systemPrompt: aiConfig.systemPrompt || '',
        instagramSystemPrompt: useCustomIgPrompt ? igSystemPrompt : '',
        askContactNumber,
        isEnabled: aiConfig.isEnabled,
      });
      showToast('✅ Instagram AI settings saved successfully', 'success');
      await fetchAiConfig();
    } catch {
      showToast('Failed to save Instagram AI settings', 'error');
    } finally {
      setSavingAi(false);
    }
  };

  const isConnected = accounts.length > 0;

  // ─── Load FB SDK (same SDK works for IG login) ──────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.FB) { setSdkReady(true); return; }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        autoLogAppEvents: false, // prevent SDK from globally overriding the access token after login
        xfbml: false,            // not using FB social plugins (like/share buttons)
        version: 'v20.0',
      });
      setSdkReady(true);
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // ─── Fetch connected accounts ────────────────────────────────────────────────
  const fetchAccounts = useCallback(async () => {
    setFetchingAccounts(true);
    try {
      const resp = await getConnectedInstagramAccounts();
      setAccounts(resp.data?.data || []);
    } catch {
      // silently fail on initial load
    } finally {
      setFetchingAccounts(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // ─── Facebook Login to get Page + IG account ─────────────────────────────────
  const handleConnect = () => {
    if (!sdkReady || !window.FB) {
      showToast('Facebook SDK is still loading. Please try again.', 'error');
      return;
    }
    setLoading(true);

    window.FB.login(
      (response: FBLoginResponse) => {
        (async () => {
          if (!response.authResponse?.accessToken) {
            setLoading(false);
            showToast('Instagram authorization was cancelled or failed.', 'error');
            return;
          }

          try {
            const userToken = response.authResponse.accessToken;

            // Log what permissions were actually granted
            const grantedScopes = (response.authResponse as unknown as { grantedScopes?: string })?.grantedScopes;
            console.log('✅ Granted scopes:', grantedScopes);

            // 1. Fetch the list of Facebook Pages the user manages
            const pagesResp = await fetch(
              `https://graph.facebook.com/v20.0/me/accounts?access_token=${userToken}`
            );
            const pagesData = await pagesResp.json();
            console.log('📘 Pages API Response:', pagesData);

            if (pagesData.error) {
              showToast(`Facebook API Error: ${pagesData.error.message}`, 'error');
              setLoading(false);
              return;
            }

            const pages: Array<{ id: string; access_token: string; name: string }> = pagesData.data || [];

            if (pages.length === 0) {
              showToast('No Facebook Pages found. Please create a Facebook Page and link your Instagram Business account to it.', 'error');
              setLoading(false);
              return;
            }

            let connected = 0;

            for (const page of pages) {
              console.log(`🔍 Processing page: "${page.name}" (${page.id})`);

              // Strategy 1: Try the page access token directly (works if instagram_basic was granted)
              let igUserId: string | null = null;
              let igUsername: string | null = null;

              const directResp = await fetch(
                `https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
              );
              const directData = await directResp.json();
              console.log(`📘 Direct page lookup for "${page.name}":`, directData);

              if (directData.instagram_business_account?.id) {
                igUserId = directData.instagram_business_account.id;
                // Fetch username via page token
                try {
                  const unameResp = await fetch(
                    `https://graph.facebook.com/v20.0/${igUserId}?fields=username&access_token=${page.access_token}`
                  );
                  const unameData = await unameResp.json();
                  igUsername = unameData.username || null;
                } catch { /* no-op */ }
                console.log(`✅ [Direct] Found IG account: ${igUsername || igUserId}`);
              }

              // Strategy 2: Server-side lookup using META_SYSTEM_USER_TOKEN (never exposed to browser)
              // This works even when instagram_basic permission wasn't granted by the user
              if (!igUserId) {
                console.log(`⚠️ Direct lookup returned no IG account for "${page.name}" — trying server-side system token lookup...`);
                try {
                  const serverLookup = await lookupInstagramPage(page.id);
                  console.log('📘 Server-side lookup result:', serverLookup);

                  if (serverLookup.success && serverLookup.data?.igUserId) {
                    igUserId = serverLookup.data.igUserId;
                    igUsername = serverLookup.data.igUsername || null;
                    console.log(`✅ [Server token] Found IG account: ${igUsername || igUserId}`);
                  } else {
                    console.warn(`⚠️ Server lookup: ${serverLookup.error}`);
                    if (serverLookup.hint) console.warn(`   Hint: ${serverLookup.hint}`);
                  }
                } catch (lookupErr) {
                  console.error('❌ Server-side IG lookup failed:', lookupErr);
                }
              }

              if (!igUserId) {
                console.warn(`❌ No Instagram Business Account found for page "${page.name}" via any method.`);
                console.warn(`   ACTION REQUIRED: Go to the "${page.name}" Facebook Page → Settings → Linked Accounts → Instagram and connect your account.`);
                continue;
              }

              // 4. Store to backend
              await connectInstagramIntegration({
                pageId: page.id,
                igUserId,
                igUsername: igUsername || undefined,
                pageAccessToken: page.access_token,
              });
              connected++;
              console.log(`🎉 Connected Instagram @${igUsername || igUserId} for page "${page.name}"`);
            }

            if (connected === 0) {
              showToast(
                '⚠️ Could not find an Instagram Business Account linked to your Facebook Page. Go to your Page → Settings → Linked Accounts → Instagram and connect your account, then try again.',
                'error'
              );
            } else {
              showToast(`✅ ${connected} Instagram account(s) connected successfully!`, 'success');
              await fetchAccounts();
            }
          } catch (err) {
            const e = err as { message?: string };
            console.error('❌ Error during Facebook/Instagram connection flow:', err);
            showToast(e?.message || 'Failed to connect Instagram.', 'error');
          } finally {
            setLoading(false);
          }
        })();
      },
      {
        scope: IG_PERMISSIONS.join(','),
        return_scopes: true,
      }
    );
  };

  // ─── Disconnect ───────────────────────────────────────────────────────────────
  const handleDisconnect = async (pageId: string, label: string) => {
    if (!confirm(`Disconnect Instagram account @${label}? DM messages will stop being received.`)) return;
    setDisconnectingId(pageId);
    try {
      await disconnectInstagramAccount(pageId);
      setAccounts(prev => prev.filter(a => a.pageId !== pageId));
      showToast(`@${label} disconnected successfully`, 'success');
    } catch {
      showToast('Failed to disconnect. Please try again.', 'error');
    } finally {
      setDisconnectingId(null);
    }
  };

  // ─── Manual connect ───────────────────────────────────────────────────────────
  const handleManualConnect = async () => {
    if (!manualPageId || !manualIgUserId || !manualToken) {
      showToast('Page ID, IG User ID, and Page Access Token are required', 'error');
      return;
    }
    setLoading(true);
    try {
      await connectInstagramIntegration({
        pageId: manualPageId,
        igUserId: manualIgUserId,
        igUsername: manualIgUsername || undefined,
        pageAccessToken: manualToken,
      });
      showToast('Instagram connected successfully', 'success');
      await fetchAccounts();
      setManualPageId(''); setManualIgUserId(''); setManualIgUsername(''); setManualToken('');
      setShowManual(false);
    } catch (err) {
      console.error('❌ Error during manual Instagram connection:', err);
      showToast('Failed to connect Instagram', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roundedClass =
    activeIndex === 0 ? 'rounded-tr-[28px] rounded-bl-[28px] rounded-br-[28px] rounded-tl-0' :
      activeIndex === total - 1 ? 'rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-0' :
        'rounded-[28px]';

  // Instagram brand gradient
  const igGradient = 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)';

  return (
    <div
      className={`flex h-full w-full flex-col gap-4 p-4 shadow-[0_18px_34px_rgba(35,58,120,0.18)] lg:p-5 xl:pl-[40px] animate-slide-up-fade ${roundedClass}`}
      style={{
        backgroundColor: COLORS.primary,
        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      <div className="rounded-[24px] bg-[#E2E8F0] px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[13px] shadow-[0_8px_18px_rgba(225,48,108,0.3)]"
            style={{ background: igGradient }}
          >
            <img src="/instagram.png" alt="Instagram" className="h-7 w-7 object-contain brightness-0 invert" />
          </div>
          <div className="flex-1">
            <Text as="h2" weight="bold" style={{ fontSize: '17px', lineHeight: '1.25' }} className="text-[#0D1B3E]">
              Instagram DM
            </Text>
            <Text className="text-[#64748B]" size="xs" weight="medium">
              Connect your Instagram Business account to receive &amp; reply to DMs
            </Text>
          </div>
          <button
            onClick={fetchAccounts}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748B] hover:bg-white/50 transition-all"
            title="Refresh accounts"
          >
            <RefreshCw className={`h-4 w-4 ${fetchingAccounts ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 24-hour window notice */}
      <div className="rounded-[16px] bg-[#FFF7ED] border border-[#FDBA74] px-4 py-3 flex items-start gap-2">
        <span className="text-orange-500 text-sm mt-0.5">⚠️</span>
        <Text size="xs" className="text-[#9A3412]" weight="medium">
          Instagram enforces a <strong>24-hour reply window</strong>. You can only reply to a customer within 24 hours of their last message. No template fallback is available.
        </Text>
      </div>

      {/* Connected Accounts */}
      {fetchingAccounts ? (
        <div className="flex items-center justify-center rounded-[22px] bg-[#E2E8F0] px-4 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#0D1B3E]" />
          <Text size="sm" className="ml-2 text-[#64748B]">Loading accounts...</Text>
        </div>
      ) : accounts.length > 0 ? (
        <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="h-4 w-4 text-pink-500" />
            <Text weight="bold" className="text-[#0D1B3E]" style={{ fontSize: '14px' }}>
              Connected Accounts ({accounts.length})
            </Text>
          </div>
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.pageId}
                className="flex items-center justify-between rounded-[14px] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: igGradient }}
                  >
                    <img src="/instagram.png" alt="Instagram" className="h-5 w-5 object-contain brightness-0 invert" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Text weight="semibold" className="text-[#0D1B3E]" size="sm">
                        {account.igUsername ? `@${account.igUsername}` : account.igUserId}
                      </Text>
                    </div>
                    <Text size="xs" className="text-[#64748B] truncate">
                      Page ID: {account.pageId?.slice(-8)} · IG ID: {account.igUserId?.slice(-8)}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-semibold text-pink-700">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                  <button
                    onClick={() => handleDisconnect(account.pageId, account.igUsername || account.igUserId)}
                    disabled={disconnectingId === account.pageId}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                    title="Disconnect"
                  >
                    {disconnectingId === account.pageId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add another account */}
          <button
            onClick={handleConnect}
            disabled={loading || !sdkReady}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-[#CBD5E1] bg-transparent py-2.5 text-[13px] font-semibold text-[#64748B] transition-all hover:border-[#d6249f] hover:text-[#d6249f] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
            Add Another Account
          </button>
        </div>
      ) : (
        /* Connect CTA */
        <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center text-center gap-3 mb-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-[16px] shadow-md"
              style={{ background: igGradient }}
            >
              <WifiOff className="h-7 w-7 text-white" />
            </div>
            <div>
              <Text weight="bold" className="text-[#0D1B3E]" style={{ fontSize: '15px' }}>
                Not connected yet
              </Text>
              <Text size="xs" className="text-[#64748B] mt-0.5">
                Connect your Instagram Business account via Facebook Login.
                Your Instagram must be a Business or Creator account linked to a Facebook Page.
              </Text>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleConnect}
            disabled={loading || !sdkReady}
            className="w-full text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-70"
            style={{ background: igGradient }}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting to Instagram...</span>
              </div>
            ) : !sdkReady ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading SDK...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <img src="/instagram.png" alt="" className="h-5 w-5 object-contain brightness-0 invert" />
                <span>Connect with Instagram</span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Instagram AI System Prompt & Settings */}
      <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)] space-y-3">
        <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <Text weight="bold" className="text-[#0D1B3E]" style={{ fontSize: '14px' }}>
              Instagram AI System Prompt &amp; Lead Settings
            </Text>
          </div>
          <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${
            aiConfig?.isEnabled ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {aiConfig?.isEnabled ? 'AI Active' : 'AI Inactive'}
          </span>
        </div>

        {/* Prompt Mode Toggle */}
        <div className="flex items-center justify-between bg-white/70 p-2 rounded-xl border border-slate-200">
          <Text size="xs" weight="semibold" className="text-[#0D1B3E]">
            Instagram Prompt Mode
          </Text>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setUseCustomIgPrompt(false)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                !useCustomIgPrompt
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Same as WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setUseCustomIgPrompt(true)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                useCustomIgPrompt
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Instagram Prompt
            </button>
          </div>
        </div>

        {/* System Prompt Input */}
        {useCustomIgPrompt ? (
          <div>
            <Text size="xs" weight="medium" className="text-[#64748B] mb-1 ml-1">
              Custom Instagram System Prompt
            </Text>
            <div className="rounded-[14px] bg-white border border-transparent focus-within:border-purple-300 transition-all">
              <textarea
                value={igSystemPrompt}
                onChange={e => setIgSystemPrompt(e.target.value)}
                rows={4}
                placeholder="Describe how AI should behave specifically for Instagram DMs…"
                className="w-full resize-none bg-transparent px-4 py-3 text-[13px] text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-[#64748B] bg-white/60 p-3 rounded-[14px]">
            ℹ️ AI is configured to use the same System Prompt as WhatsApp for Instagram DMs.
          </p>
        )}

        {/* Ask for contact number option */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-300/60">
          <div>
            <Text size="xs" weight="semibold" className="text-[#0D1B3E]">
              Ask for Contact/WhatsApp Number in Instagram Chat
            </Text>
            <p className="text-[11px] text-[#64748B]">
              AI will ask Instagram users for their phone/WhatsApp number if missing, and automatically update the lead record.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAskContactNumber(v => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              askContactNumber ? 'bg-purple-600' : 'bg-[#CBD5E1]'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                askContactNumber ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Save button */}
        <Button
          variant="primary"
          onClick={handleSaveAi}
          disabled={savingAi || !aiConfig}
          className="w-full h-[40px] rounded-full text-[13px] font-bold transition-all disabled:opacity-70"
          style={{ background: igGradient }}
        >
          {savingAi ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <span>Save Instagram AI Settings</span>
          )}
        </Button>
      </div>

      {/* Manual Setup Accordion */}
      <div className="rounded-[22px] bg-[#E2E8F0] shadow-[0_4px_12px_rgba(15,23,42,0.06)] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowManual(v => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-[#64748B]" />
            <Text size="xs" weight="semibold" className="text-[#64748B]">Manual / Advanced Setup</Text>
          </div>
          <ChevronDown className={`h-4 w-4 text-[#64748B] transition-transform ${showManual ? 'rotate-180' : ''}`} />
        </button>

        {showManual && (
          <div className="px-4 pb-4 space-y-3 border-t border-[#CBD5E1]">
            <Text size="xs" className="text-[#94A3B8] pt-3">
              Enter your Facebook Page ID, Instagram Business Account ID, and a long-lived Page Access Token.
            </Text>
            {[
              { label: 'Facebook Page ID', value: manualPageId, set: setManualPageId, placeholder: 'e.g. 123456789012345' },
              { label: 'Instagram User ID (igUserId)', value: manualIgUserId, set: setManualIgUserId, placeholder: 'e.g. 987654321098765' },
              { label: 'Instagram Username (optional)', value: manualIgUsername, set: setManualIgUsername, placeholder: 'e.g. anad_crm' },
              { label: 'Page Access Token', value: manualToken, set: setManualToken, placeholder: 'EAA...', isPassword: true },
            ].map(({ label, value, set, placeholder, isPassword }) => (
              <div key={label}>
                <Text size="xs" weight="semibold" className="text-[#0D1B3E] mb-1 ml-1">{label}</Text>
                <div className="rounded-[12px] bg-white px-4 py-1.5 border border-transparent focus-within:border-gray-200 transition-all">
                  <input
                    type={isPassword ? 'password' : 'text'}
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-1 py-2 text-[13px] text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="primary"
              onClick={handleManualConnect}
              disabled={loading}
              className="w-full h-[40px] rounded-full text-[13px] font-bold disabled:opacity-70"
              style={{ background: igGradient }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect Manually'}
            </Button>
          </div>
        )}
      </div>

      {/* Help links */}
      <div className="flex flex-col gap-2.5">
        {HELP_TOPICS.map((topic, i) => (
          <a
            key={i}
            href={topic.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-[16px] bg-[#E2E8F0] px-4 py-3 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all hover:bg-[#D4DEE9] group"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full group-hover:scale-110 transition-transform"
                style={{ background: igGradient }}
              >
                <Text weight="bold" className="text-white" size="custom" style={{ fontSize: '10px' }}>?</Text>
              </div>
              <Text weight="semibold" className="text-[#0D1B3E]" size="xs">{topic.label}</Text>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
          </a>
        ))}
      </div>
    </div>
  );
};
