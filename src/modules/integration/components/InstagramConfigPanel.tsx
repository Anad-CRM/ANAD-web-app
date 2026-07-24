'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2, ChevronDown, ExternalLink, Key, Loader2,
  RefreshCw, Trash2, Wifi, WifiOff, Instagram,
} from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import Button from '@/core/components/ui/Button';
import {
  getConnectedInstagramAccounts,
  connectInstagramIntegration,
  disconnectInstagramAccount,
} from '../api/instagramApi';
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
  'pages_messaging',
  'pages_read_engagement',
  'pages_manage_metadata',
  'pages_show_list',
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

  const isConnected = accounts.length > 0;

  // ─── Load FB SDK (same SDK works for IG login) ──────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.FB) { setSdkReady(true); return; }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
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

            // 1. Fetch pages
            const pagesResp = await fetch(
              `https://graph.facebook.com/v20.0/me/accounts?access_token=${userToken}`
            );
            const pagesData = await pagesResp.json();
            const pages: Array<{ id: string; access_token: string; name: string }> = pagesData.data || [];

            if (pages.length === 0) {
              showToast('No Facebook Pages found. Please create a Page linked to your Instagram account.', 'error');
              setLoading(false);
              return;
            }

            let connected = 0;
            for (const page of pages) {
              // 2. Check if this page has a linked Instagram Business Account
              const igResp = await fetch(
                `https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
              );
              const igData = await igResp.json();
              const igAccount = igData.instagram_business_account;

              if (!igAccount?.id) continue; // This page has no IG account linked

              // 3. Fetch IG username
              const igInfoResp = await fetch(
                `https://graph.facebook.com/v20.0/${igAccount.id}?fields=username&access_token=${page.access_token}`
              );
              const igInfo = await igInfoResp.json();

              // 4. Store to backend
              await connectInstagramIntegration({
                pageId: page.id,
                igUserId: igAccount.id,
                igUsername: igInfo.username || null,
                pageAccessToken: page.access_token,
              });
              connected++;
            }

            if (connected === 0) {
              showToast(
                'No Instagram Business accounts found linked to your Pages. Make sure your Instagram is a Business or Creator account connected to a Facebook Page.',
                'error'
              );
            } else {
              showToast(`✅ ${connected} Instagram account(s) connected successfully!`, 'success');
              await fetchAccounts();
            }
          } catch (err) {
            const e = err as { message?: string };
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
    } catch {
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
