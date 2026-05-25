import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { connectGoogleAds, disconnectGoogleAds } from '../api/integrationApi';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import { useGoogleLogin } from '@react-oauth/google';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import Button from '@/core/components/ui/Button';

type GoogleCodeResponse = {
  code: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

interface Props {
  activeIndex: number;
  total: number;
}

export const GoogleConfigPanel: React.FC<Props> = ({ activeIndex, total }) => {
  const { user } = useAuthContext();
  const isConnected = user?.isGoogleConnected === "Connected";
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useFeedback();

  const handleGoogleSuccess = async (codeResponse: GoogleCodeResponse) => {
    setLoading(true);
    setError(null);
    try {
      await connectGoogleAds(codeResponse.code);
      showToast("Google Ads Integration Connected Successfully! 🎉", "success");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.message || apiError?.message || "Failed to connect integration");
      showToast("Connection failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setError("Google Login was unsuccessful or cancelled.");
      showToast("Google login failed", "error");
    },
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid'
  });

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
       await disconnectGoogleAds();
       showToast("Google Ads successfully disconnected.", "success");
    } catch (err) {
       showToast("Failed to disconnect Google Ads", "error");
    } finally {
       setDisconnecting(false);
    }
  };

  const handleConnect = () => login();

  return (
    <div 
      className={`p-5 lg:p-6 flex h-full flex-col shadow-sm w-full xl:pl-[40px] animate-slide-up-fade ${
        activeIndex === 0 ? "rounded-tr-[28px] rounded-bl-[28px] rounded-br-[28px] rounded-tl-0" : 
        activeIndex === total - 1 ? "rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-0" : 
        "rounded-[28px]"
      }`}
      style={{ 
        backgroundColor: COLORS.primary,
        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div 
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white shadow-sm"
        >
          <img src="/ads.png" alt="Google Ads" className="w-7 h-7 object-contain" />
        </div>
        <div>
          <Text as="h2" weight="bold" className="text-white mb-1" style={{ fontSize: '17px', lineHeight: '1.25' }}>
            Google Ads
          </Text>
          <Text weight="medium" className="text-white/80" size="xs">
            Receive new leads from Google Ads Lead Form Assets in your account
          </Text>
        </div>
      </div>

      <div className="p-4 lg:p-5 flex flex-col gap-4 bg-[#E2E8F0] rounded-[24px]">
        <div className="bg-[#E3F2FD] border border-[#90CAF9] rounded-[12px] p-4 flex gap-2">
          <div className="text-[#1565C0] mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <Text weight="medium" className="text-[#1565C0]" size="custom" style={{ fontSize: '12px', lineHeight: '1.25' }}>
            Linking your Google Ads account allows the CRM to automatically capture leads from Lead Form Extensions without manual exports.
          </Text>
        </div>
        
        {error && <Text className="text-red-500 font-medium px-1" size="xs">{error}</Text>}

        <div className="flex gap-4">
          {isConnected ? (
            <Button 
              variant="primary"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="w-full bg-red-600 text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:bg-red-700 disabled:opacity-70 flex items-center justify-center"
            >
              {disconnecting ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 "Disconnect Google Ads"
              )}
            </Button>
          ) : (
            <Button 
              variant="primary"
              onClick={handleConnect}
              disabled={loading}
              className="w-full text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 "Connect Google Ads"
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-5">
        {[
          "How to get Google Ads Customer ID",
          "Setting up Google Cloud Project",
          "Generating OAuth 2.0 Credentials"
        ].map((topic, i) => (
          <button
            key={topic}
            type="button"
            className="flex items-center justify-between rounded-[16px] bg-[#E2E8F0] px-4 py-3 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all hover:bg-[#D4DEE9] group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D1B3E] group-hover:scale-110 transition-transform">
                 <Text weight="bold" className="text-white" size="custom" style={{ fontSize: '10px' }}>?</Text>
              </div>
              <Text weight="semibold" className="text-[#0D1B3E]" size="xs">{topic}</Text>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-y-0.5" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
};
