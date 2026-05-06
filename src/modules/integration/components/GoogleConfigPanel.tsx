import React, { useState } from 'react';
import { connectGoogleAds, disconnectGoogleAds } from '../api/integrationApi';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import { useGoogleLogin } from '@react-oauth/google';

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

export const GoogleConfigPanel: React.FC = () => {
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
      showToast("Google Ads Integration Connected Successfully! ðŸŽ‰", "success");
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
    setError(null);
    try {
       await disconnectGoogleAds();
       showToast("Google Ads integration successfully disconnected.", "success");
    } catch (err: unknown) {
       const apiError = err as ApiError;
       setError(apiError?.response?.data?.message || apiError?.message || "Failed to disconnect integration");
    } finally {
       setDisconnecting(false);
    }
  };

  return (
    <div className="bg-[#2B5299] rounded-3xl p-5 lg:p-6 flex flex-col shadow-sm h-full">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 shrink-0">
          <div className="relative w-8 h-8 mt-1">
            <div className="absolute left-0 bottom-0 top-1/2 -mt-2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#F4B400] rotate-[30deg]"></div>
            <div className="absolute right-0 bottom-0 top-1/2 -mt-2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#4285F4] -rotate-[30deg]"></div>
            <div className="absolute left-1/2 -ml-[12px] bottom-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#0F9D58]"></div>
          </div>
        </div>
        <div>
          <h2 className="text-white text-[17px] font-semibold leading-tight mb-2 tracking-wide">
            Google Ads API
          </h2>
          <div className="text-white/80 text-[13px] font-medium tracking-wide">
             <p>Receive new leads from Google Ads Lead Form Assets automatically.</p>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-5 flex flex-col gap-4">
        <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-[8px] p-4 flex gap-2">
          <div className="text-[#E65100] mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <p className="text-[12px] text-[#E65100] leading-snug">
            Important: You will be asked to select your Google Account and grant access to manage your Google Ads campaigns.
          </p>
        </div>
        
        {error && <p className="text-red-500 text-xs font-medium px-1 mb-4">{error}</p>}

        <div className="flex gap-4">
          {isConnected ? (
            <button 
              onClick={handleDisconnect}
              disabled={disconnecting}
            className="w-full bg-red-600 text-white py-3.5 rounded-[14px] text-[15px] font-medium transition-colors hover:bg-red-700 disabled:opacity-70 flex justify-center items-center h-[48px]"
            >
              {disconnecting ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 "Disconnect Google Ads"
              )}
            </button>
          ) : (
            <button 
              onClick={() => login()}
              disabled={loading}
            className="w-full bg-[#1C3A76] text-white py-3.5 rounded-[14px] text-[15px] font-medium transition-colors hover:bg-[#11234D] disabled:opacity-70 flex justify-center items-center h-[48px]"
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
