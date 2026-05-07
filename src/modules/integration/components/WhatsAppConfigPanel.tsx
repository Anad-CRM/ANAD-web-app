import React, { useState } from 'react';
import { ChevronDown, ClipboardList, Eye, EyeOff, Key } from 'lucide-react';
import { COLORS } from "@/core/components/theme/colors";
import { disconnectWhatsAppIntegration, connectWhatsAppIntegration } from "../api/integrationApi";
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFeedback } from '@/core/contexts/FeedbackContext';

interface Props {
  activeIndex: number;
  total: number;
}

const HELP_TOPICS = [
  "How to create Access token",
  "Find your Phone Number ID",
  "WhatsApp Business Account (WABA) ID",
  "Setting up Webhook URL"
];

export const WhatsAppConfigPanel: React.FC<Props> = ({ activeIndex, total }) => {
  const { user } = useAuthContext();
  const isConnected = user?.isWhatsAppConnected === "Connected";
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const { showToast } = useFeedback();

  const handleConnect = async () => {
    if (!token) {
      showToast("Please enter a valid access token", "error");
      return;
    }
    setLoading(true);
    try {
      await connectWhatsAppIntegration({
        whatsappBusinessAccountId: "pending",
        phoneNumberId: "pending",
        displayPhoneNumber: "pending",
        accessToken: token,
      });
      showToast("WhatsApp integrated successfully", "success");
    } catch (err) {
      showToast("Failed to integrate WhatsApp", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectWhatsAppIntegration();
      showToast("WhatsApp disconnected successfully", "success");
    } catch (err) {
      showToast("Failed to disconnect WhatsApp", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!token) {
      showToast("No token to copy", "error");
      return;
    }
    navigator.clipboard.writeText(token);
    showToast("Access token copied to clipboard", "success");
  };

  return (
    <div 
      className={`flex h-full w-full flex-col gap-4 p-4 shadow-[0_18px_34px_rgba(35,58,120,0.18)] lg:p-5 xl:pl-[40px] animate-slide-up-fade ${
        activeIndex === 0 ? "rounded-tr-[28px] rounded-bl-[28px] rounded-br-[28px] rounded-tl-0" : 
        activeIndex === total - 1 ? "rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-0" : 
        "rounded-[28px]"
      }`}
      style={{ 
        backgroundColor: COLORS.primary,
        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}
    >
      <div className="rounded-[24px] bg-[#E2E8F0] px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-4">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_18px_rgba(35,58,120,0.25)]"
            style={{ backgroundColor: COLORS.primary }}
          >
            <img src="/whatsapp.png" alt="WhatsApp" className="h-7 w-7 object-contain" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold leading-tight text-[#1A1A1A]">WhatsApp Business</h2>
            <p className="text-[13px] font-medium text-[#64748B]">Receive new leads from Whatsapp Business in your account</p>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] bg-[#E2E8F0] px-4 py-4 lg:px-5 lg:py-4">
        <div className="flex items-center gap-2.5">
          <Key className="h-5 w-5 text-[#111827]" strokeWidth={2.5} />
          <h3 className="text-[16px] font-bold text-[#111827]">Access Token</h3>
        </div>

        <div className="mt-3 rounded-[16px] bg-white px-4 py-1.5 shadow-[0_6px_16px_rgba(15,23,42,0.06)] border border-transparent focus-within:border-gray-200 transition-all">
          <div className="flex items-center gap-1">
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="paste your permanent access token"
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[14px] text-[#374151] placeholder:text-[#6B7280] focus:outline-none"
            />
            <button 
              type="button" 
              onClick={() => setShowToken(!showToken)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black" 
              aria-label={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? <EyeOff className="h-4 w-4" strokeWidth={2.5} /> : <Eye className="h-4 w-4" strokeWidth={2.5} />}
            </button>
            <button 
              type="button" 
              onClick={copyToClipboard}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black" 
              aria-label="Copy token"
            >
              <ClipboardList className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          {isConnected ? (
            <button 
              onClick={handleDisconnect}
              disabled={loading}
              className="flex h-[48px] w-full items-center justify-center rounded-full px-5 text-[15px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loading ? (
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                 "Disconnect WhatsApp Business"
              )}
            </button>
          ) : (
            <button 
              onClick={handleConnect}
              disabled={loading}
              className="flex h-[48px] w-full items-center justify-center rounded-full px-5 text-[15px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loading ? (
                 <div className="flex items-center gap-3">
                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                   <span>Connecting...</span>
                 </div>
              ) : (
                 "Connect WhatsApp Business"
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {HELP_TOPICS.map((topic, i) => (
          <button
            key={i}
            type="button"
            className="flex items-center justify-between rounded-[16px] bg-[#E2E8F0] px-4 py-3 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all hover:bg-[#D4DEE9] group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] group-hover:scale-110 transition-transform">
                 <span className="text-[10px] font-bold text-white">?</span>
              </div>
              <span className="text-[13px] font-semibold text-[#111827]">{topic}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-y-0.5" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
};
