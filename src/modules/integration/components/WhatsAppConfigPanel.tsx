'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2, ChevronDown, ExternalLink, Key, Loader2,
  PhoneCall, RefreshCw, ShieldCheck, Trash2, Wifi, WifiOff, Zap,
} from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import Button from '@/core/components/ui/Button';
import {
  handleEmbeddedSignupCallback,
  getConnectedWhatsAppAccounts,
  disconnectWhatsAppAccount,
  connectWhatsAppIntegration,
  disconnectWhatsAppIntegration,
} from '../api/integrationApi';
import type { FBLoginResponse } from '../types/facebook';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFeedback } from '@/core/contexts/FeedbackContext';

interface Props {
  activeIndex: number;
  total: number;
}

interface ConnectedAccount {
  id: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  whatsappBusinessAccountId: string;
  businessId: string;
  status: string;
  tokenType: 'manual' | 'embedded_signup' | 'system_user';
  tokenExpiresAt: string | null;
  lastConnectedAt: string;
}


const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID || '';

const HELP_TOPICS = [
  { label: 'What is Meta Embedded Signup?', href: 'https://developers.facebook.com/docs/whatsapp/embedded-signup' },
  { label: 'WhatsApp Business Account (WABA) setup', href: 'https://business.facebook.com/wa/manage/home' },
  { label: 'Troubleshoot connection issues', href: 'https://developers.facebook.com/docs/whatsapp/troubleshooting' },
  { label: 'Template message requirements', href: 'https://developers.facebook.com/docs/whatsapp/message-templates' },
];

export const WhatsAppConfigPanel: React.FC<Props> = ({ activeIndex, total }) => {
  const { user } = useAuthContext();
  const { showToast } = useFeedback();

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  // Manual fallback state
  const [manualToken, setManualToken] = useState('');
  const [manualPhoneId, setManualPhoneId] = useState('');
  const [manualWabaId, setManualWabaId] = useState('');

  const isConnected = accounts.length > 0;

  // ─── Load FB SDK ────────────────────────────────────────────────
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

  // ─── Fetch connected accounts ────────────────────────────────────
  const fetchAccounts = useCallback(async () => {
    setFetchingAccounts(true);
    try {
      const resp = await getConnectedWhatsAppAccounts();
      setAccounts(resp.data?.data || []);
    } catch {
      // silently fail on initial load
    } finally {
      setFetchingAccounts(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // ─── Embedded Signup ─────────────────────────────────────────────
  const handleConnect = () => {
    if (!sdkReady || !window.FB) {
      showToast('Facebook SDK is still loading. Please try again.', 'error');
      return;
    }

    setLoading(true);

    window.FB.login(
      async (response: FBLoginResponse) => {
        if (!response.authResponse?.code) {
          setLoading(false);
          showToast('WhatsApp authorization was cancelled or failed.', 'error');
          return;
        }

        try {
          const result = await handleEmbeddedSignupCallback(response.authResponse.code);
          const connected: ConnectedAccount[] = result.data?.data || [];
          setAccounts(prev => {
            const existing = prev.filter(a => !connected.some(c => c.phoneNumberId === a.phoneNumberId));
            return [...existing, ...connected];
          });
          showToast(`✅ ${connected.length} WhatsApp account(s) connected successfully!`, 'success');
        } catch (err) {
          const e = err as { response?: { data?: { error?: string } } };
          const msg = e?.response?.data?.error || 'Failed to complete WhatsApp setup.';
          showToast(msg, 'error');
        } finally {
          setLoading(false);
        }
      },
      {
        config_id: META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '2' },
      }
    );
  };

  // ─── Disconnect ───────────────────────────────────────────────────
  const handleDisconnect = async (phoneNumberId: string, displayPhone: string) => {
    if (!confirm(`Disconnect ${displayPhone}? Incoming messages will stop being received.`)) return;
    setDisconnectingId(phoneNumberId);
    try {
      await disconnectWhatsAppAccount(phoneNumberId);
      setAccounts(prev => prev.filter(a => a.phoneNumberId !== phoneNumberId));
      showToast(`${displayPhone} disconnected successfully`, 'success');
    } catch {
      showToast('Failed to disconnect. Please try again.', 'error');
    } finally {
      setDisconnectingId(null);
    }
  };

  // ─── Manual connect ───────────────────────────────────────────────
  const handleManualConnect = async () => {
    if (!manualToken || !manualPhoneId || !manualWabaId) {
      showToast('Please enter all required credentials', 'error');
      return;
    }
    setLoading(true);
    try {
      await connectWhatsAppIntegration({
        whatsappBusinessAccountId: manualWabaId,
        phoneNumberId: manualPhoneId,
        displayPhoneNumber: manualPhoneId,
        accessToken: manualToken,
      });
      showToast('WhatsApp connected successfully', 'success');
      await fetchAccounts();
      setManualToken(''); setManualPhoneId(''); setManualWabaId('');
      setShowManual(false);
    } catch {
      showToast('Failed to connect WhatsApp', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roundedClass =
    activeIndex === 0 ? 'rounded-tr-[28px] rounded-bl-[28px] rounded-br-[28px] rounded-tl-0' :
    activeIndex === total - 1 ? 'rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-0' :
    'rounded-[28px]';

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
            className="flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_18px_rgba(35,58,120,0.25)]"
            style={{ backgroundColor: COLORS.primary }}
          >
            <img src="/whatsapp.png" alt="WhatsApp" className="h-7 w-7 object-contain" />
          </div>
          <div className="flex-1">
            <Text as="h2" weight="bold" style={{ fontSize: '17px', lineHeight: '1.25' }} className="text-[#0D1B3E]">
              WhatsApp Business
            </Text>
            <Text className="text-[#64748B]" size="xs" weight="medium">
              Multi-tenant WhatsApp integration via Meta Embedded Signup
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

      {/* Connected Accounts */}
      {fetchingAccounts ? (
        <div className="flex items-center justify-center rounded-[22px] bg-[#E2E8F0] px-4 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#0D1B3E]" />
          <Text size="sm" className="ml-2 text-[#64748B]">Loading accounts...</Text>
        </div>
      ) : accounts.length > 0 ? (
        <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="h-4 w-4 text-green-600" />
            <Text weight="bold" className="text-[#0D1B3E]" style={{ fontSize: '14px' }}>
              Connected Accounts ({accounts.length})
            </Text>
          </div>
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.phoneNumberId}
                className="flex items-center justify-between rounded-[14px] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <PhoneCall className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Text weight="semibold" className="text-[#0D1B3E]" size="sm">
                        {account.displayPhoneNumber}
                      </Text>
                      {account.tokenType === 'embedded_signup' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <Text size="xs" className="text-[#64748B] truncate">
                      {account.verifiedName || 'Unknown'} · WABA: {account.whatsappBusinessAccountId?.slice(-6)}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                  <button
                    onClick={() => handleDisconnect(account.phoneNumberId, account.displayPhoneNumber)}
                    disabled={disconnectingId === account.phoneNumberId}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                    title="Disconnect"
                  >
                    {disconnectingId === account.phoneNumberId ? (
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
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-[#CBD5E1] bg-transparent py-2.5 text-[13px] font-semibold text-[#64748B] transition-all hover:border-[#0D1B3E] hover:text-[#0D1B3E] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Add Another Account
          </button>
        </div>
      ) : (
        /* Connect CTA */
        <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center text-center gap-3 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 shadow-md">
              <WifiOff className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <Text weight="bold" className="text-[#0D1B3E]" style={{ fontSize: '15px' }}>
                Not connected yet
              </Text>
              <Text size="xs" className="text-[#64748B] mt-0.5">
                Connect your WhatsApp Business Account using Meta Embedded Signup.
                No developer account required.
              </Text>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleConnect}
            disabled={loading || !sdkReady}
            className="w-full text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting to Meta...</span>
              </div>
            ) : !sdkReady ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading SDK...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <img src="/whatsapp.png" alt="" className="h-5 w-5 object-contain" />
                <span>Connect with Meta</span>
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
              Use this if you already have a Permanent Access Token from your Meta Developer account.
            </Text>
            {[
              { label: 'Phone Number ID', value: manualPhoneId, set: setManualPhoneId, placeholder: 'e.g. 100234567890123' },
              { label: 'WABA ID', value: manualWabaId, set: setManualWabaId, placeholder: 'e.g. 100234567890456' },
              { label: 'Permanent Access Token', value: manualToken, set: setManualToken, placeholder: 'EAA...', isPassword: true },
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
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D1B3E] group-hover:scale-110 transition-transform">
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
