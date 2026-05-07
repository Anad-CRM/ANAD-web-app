import React, { useState } from 'react';
import { ChevronDown, Facebook, Instagram } from 'lucide-react';
import { connectFacebookWebhook, disconnectFacebookWebhook } from '../api/integrationApi';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFacebookSdk } from '../hooks/useFacebookSdk';
import { useFeedback } from '@/core/contexts/FeedbackContext';

type FacebookLoginResponse = {
  authResponse?: {
    userID: string;
    accessToken: string;
  };
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

type FacebookSdk = {
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options?: { scope?: string }
  ) => void;
};

interface Props {
  activeIndex: number;
  total: number;
}

export const FacebookConfigPanel: React.FC<Props> = ({ activeIndex, total }) => {
  const { user } = useAuthContext();
  const isConnected = user?.isFbConnected === "Connected";
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useFeedback();

  useFacebookSdk('816667413651539');

  const handleConnect = () => {
    setLoading(true);
    setError(null);
    
    const fb = (window as Window & { FB?: FacebookSdk }).FB;
    if (!fb) {
      setLoading(false);
      setError("Facebook SDK is not available.");
      return;
    }

    fb.login(async (response: any) => {
      if (response.authResponse) {
        try {
          await connectFacebookWebhook(response.authResponse.userID, response.authResponse.accessToken);
          showToast("Facebook webhook integration successfully created!", "success");
        } catch (err: unknown) {
          const apiError = err as ApiError;
          setError(apiError?.response?.data?.message || apiError?.message || "Failed to connect integration");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("User cancelled login or did not fully authorize.");
      }
    }, { scope: 'pages_manage_metadata,pages_read_engagement,leads_retrieval' });
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError(null);
    try {
       await disconnectFacebookWebhook();
       showToast("Facebook webhook integration successfully deleted.", "success");
    } catch (err: unknown) {
       const apiError = err as ApiError;
       setError(apiError?.response?.data?.message || apiError?.message || "Failed to disconnect integration");
    } finally {
       setDisconnecting(false);
    }
  };

  return (
    <div 
      className={`bg-[#233A78] p-5 lg:p-6 flex h-full flex-col shadow-sm w-full xl:pl-[40px] animate-slide-up-fade ${
        activeIndex === 0 ? "rounded-tr-[28px] rounded-bl-[28px] rounded-br-[28px] rounded-tl-0" : 
        activeIndex === total - 1 ? "rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-0" : 
        "rounded-[28px]"
      }`}
      style={{ transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
        <div className="flex items-start gap-4 mb-5">
          <div className="flex gap-2 shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
              <Facebook className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-white text-[17px] font-bold leading-tight mb-2 tracking-wide">
              Facebook & Instagram
            </h2>
            <div className="text-white/80 text-[13px] font-medium tracking-wide">
               <p>Receive new leads from Facebook Forms securely into your CRM.</p>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-5 flex flex-col gap-4 bg-[#E2E8F0] rounded-[24px] mb-5">
          <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-[12px] p-4 flex gap-2">
            <div className="text-[#E65100] mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <p className="text-[12px] text-[#E65100] leading-snug font-medium">
              Important: You will be asked to grant permissions for Lead Access, Pages, and Ads Management to complete the integration setup accurately.
            </p>
          </div>
          
          {error && <p className="text-red-500 text-xs font-medium px-1 mb-4">{error}</p>}

          <div className="flex gap-4">
            {isConnected ? (
              <button 
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="w-full bg-red-600 text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:bg-red-700 disabled:opacity-70 flex justify-center items-center"
              >
                {disconnecting ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                   "Disconnect Facebook Integration"
                )}
              </button>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-[#233A78] text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                   "Connect Facebook"
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-[#E2E8F0] rounded-xl px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#D4DEE9] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                   <span className="text-white text-[10px] font-bold">?</span>
                </div>
                <span className="text-[#1A1A1A] text-[14px] font-medium">How to connect Facebook</span>
              </div>
              <ChevronDown className="w-5 h-5 text-black" strokeWidth={2} />
            </div>
          ))}
        </div>
    </div>
  );
};
