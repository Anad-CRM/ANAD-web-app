/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { ChevronDown, ClipboardList, Eye, KeyRound, MessageCircle } from 'lucide-react';
import { disconnectWhatsAppIntegration } from '../api/integrationApi';
import { fetchAndCreateAllWhatsAppIntegrations } from '../api/whatsappGraphApi';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFeedback } from '@/core/contexts/FeedbackContext';

export const WhatsAppConfigPanel: React.FC = () => {
  const { user } = useAuthContext();
  const isConnected = user?.isWhatsAppConnected === "Connected";
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingText, setLoadingText] = useState("Connecting...");
  const { showToast } = useFeedback();

  const handleConnect = async () => {
    if (!token) {
      setError("Please paste your access token");
      return;
    }
    setError("");
    setLoading(true);
    setLoadingText("Fetching businesses...");

    try {
      await fetchAndCreateAllWhatsAppIntegrations(token);
      showToast("WhatsApp connected successfully! ", "success");
      setToken("");
    } catch (err: any) {
      setError(err.message || "Failed to connect to WhatsApp. Please check token.");
      showToast("Connection failed", "error");
    } finally {
      setLoading(false);
      setLoadingText("Connecting...");
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError(null);
    try {
       await disconnectWhatsAppIntegration();
       alert("WhatsApp integration successfully disconnected!"); 
    } catch (err: any) {
       setError(err?.response?.data?.message || err.message || "Failed to disconnect integration");
    } finally {
       setDisconnecting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 rounded-r-[28px] rounded-l-none bg-[#233A78] p-4 shadow-[0_18px_34px_rgba(35,58,120,0.18)] lg:p-5">
      <div className="rounded-[24px] bg-[#E2E8F0] px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#233A78] shadow-[0_8px_18px_rgba(35,58,120,0.25)]">
            <MessageCircle className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-[20px] font-bold text-[#1a1a1a] lg:text-[22px]">WhatsApp Business API</h2>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-4 lg:px-5 lg:py-4">
        <div className="flex items-center gap-2.5">
          <KeyRound className="h-5 w-5 text-[#111827]" strokeWidth={2.5} />
          <h3 className="text-[16px] font-bold text-[#111827]">Access Token</h3>
        </div>

        <div className="mt-3 rounded-[16px] bg-white px-4 py-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(null); }}
              placeholder="paste your permanent access"
              className={`min-w-0 flex-1 bg-transparent text-[14px] text-[#374151] placeholder:text-[#6B7280] focus:outline-none ${error ? 'text-red-600 placeholder:text-red-300' : ''}`}
            />
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-black transition-opacity hover:opacity-70" aria-label="Show token">
              <Eye className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-black transition-opacity hover:opacity-70" aria-label="Copy token">
              <ClipboardList className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {error && <p className="mt-3 px-1 text-xs font-medium text-red-500">{error}</p>}

        <div className="mt-4">
          {isConnected ? (
            <button 
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex h-[48px] w-full items-center justify-center rounded-full bg-[#233A78] px-5 text-[15px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-70"
            >
              {disconnecting ? (
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                 "Disconnect WhatsApp Business"
              )}
            </button>
          ) : (
            <button 
              onClick={handleConnect}
              disabled={loading}
              className="flex h-[48px] w-full items-center justify-center rounded-full bg-[#233A78] px-5 text-[15px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-70"
            >
              {loading ? (
                 <div className="flex items-center gap-3">
                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                   <span>{loadingText}</span>
                 </div>
              ) : (
                 "Connect WhatsApp Business"
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <button
            key={i}
            type="button"
            className="flex items-center justify-between rounded-[16px] bg-[#E2E8F0] px-4 py-3 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-colors hover:bg-[#D4DEE9]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-black">
                 <span className="text-[10px] font-bold text-white">?</span>
              </div>
              <span className="text-[14px] font-medium text-[#111827]">How to create Access token</span>
            </div>
            <ChevronDown className="h-4 w-4 text-black" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
};
