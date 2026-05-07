import React, { useState } from 'react';
import { connectGoogleAds, disconnectGoogleAds } from '../api/integrationApi';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import { useGoogleLogin } from '@react-oauth/google';
import { COLORS } from '@/core/components/theme/colors';

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
        backgroundColor: COLORS.primaryDark,
        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div 
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
          style={{ backgroundColor: COLORS.primaryDark }}
        >
          <img src="/integrations/google_ads.svg" alt="Google Ads" className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-white text-[17px] font-bold leading-tight mb-1">
            Google Ads
          </h2>
          <p className="text-white/80 text-[13px] font-medium">
            Receive new leads from Google Ads Lead Form Assets in your account
          </p>
        </div>
      </div>

      <div className="p-4 lg:p-5 flex flex-col gap-4 bg-[#E2E8F0] rounded-[24px]">
        <div className="bg-[#E3F2FD] border border-[#90CAF9] rounded-[12px] p-4 flex gap-2">
          <div className="text-[#1565C0] mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <p className="text-[12px] text-[#1565C0] leading-snug font-medium">
            Linking your Google Ads account allows the CRM to automatically capture leads from Lead Form Extensions without manual exports.
          </p>
        </div>
        
        <div className="flex gap-4">
          {isConnected ? (
            <button 
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="w-full bg-red-600 text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:bg-red-700 disabled:opacity-70 flex items-center justify-center"
            >
              {disconnecting ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 "Disconnect Google Ads"
              )}
            </button>
          ) : (
            <button 
              onClick={handleConnect}
              disabled={loading}
              className="w-full text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center"
              style={{ backgroundColor: COLORS.primaryDark }}
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 "Connect Google Ads"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
