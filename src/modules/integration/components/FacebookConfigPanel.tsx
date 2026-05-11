import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { connectFacebookWebhook, disconnectFacebookWebhook } from '../api/integrationApi';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFacebookSdk } from '../hooks/useFacebookSdk';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';

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
  const { user, setAuthData, token } = useAuthContext();
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

    fb.login((response: any) => {
      void (async () => {
        if (response.authResponse) {
          try {
            const userAccessToken = response.authResponse.accessToken;
            const fbResponse = await fetch(`https://graph.facebook.com/v19.0/me?fields=name,id,accounts{access_token,name,id}&access_token=${userAccessToken}`);
            const fbData = await fbResponse.json();
            
            const pages = fbData.accounts?.data;
            
            if (!pages || pages.length === 0) {
               setError("No Facebook pages found for this account.");
               setLoading(false);
               return;
            }

            let updatedUser = null;
            for (const page of pages) {
              const res = await connectFacebookWebhook(page.id, page.access_token, userAccessToken);
              if (res.data?.status === 'success' && res.data?.data) {
                updatedUser = res.data.data;
              }
            }

            if (updatedUser && token) {
               localStorage.setItem('user', JSON.stringify(updatedUser));
               setAuthData(updatedUser, token);
            }

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
      })();
    }, { scope: 'pages_manage_metadata,pages_read_engagement,leads_retrieval' });
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError(null);
    try {
       const res = await disconnectFacebookWebhook();
       
       if (res.data?.status === 'success' && res.data?.data && token) {
         localStorage.setItem('user', JSON.stringify(res.data.data));
         setAuthData(res.data.data, token);
       } else if (user && token) {
         const updatedUser = { ...user, isFbConnected: "Not Connected" };
         localStorage.setItem('user', JSON.stringify(updatedUser));
         setAuthData(updatedUser, token);
       }
       
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
          <div className="flex gap-2 shrink-0">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-white"
            >
              <img src="/fb.png" alt="Facebook" className="w-6 h-6 object-contain" />
            </div>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-white"
            >
              <img src="/instagram.png" alt="Instagram" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <div>
            <Text as="h2" className="text-white" weight="bold" style={{ fontSize: '1.125rem', lineHeight: '1.25' }}>Facebook & Instagram</Text>
            <Text className="text-white/70" size="sm" weight="medium" style={{ marginTop: '4px' }}>Receive new leads from Facebook, Instagram in your account</Text>
          </div>
        </div>

        <div className="p-4 lg:p-5 flex flex-col gap-4 bg-[#E2E8F0] rounded-[24px] mb-5">
          <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-[12px] p-4 flex gap-2">
            <div className="text-[#E65100] mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <Text className="text-[#E65100]" size="custom" weight="medium" style={{ fontSize: '12px', lineHeight: '1.25' }}>
              Important: You will be asked to grant permissions for Lead Access, Pages, and Ads Management to complete the integration setup accurately.
            </Text>
          </div>
          
          {error && <Text className="text-red-500 font-medium px-1 mb-4" size="xs">{error}</Text>}

          <div className="flex gap-4">
            {isConnected ? (
              <>
                <button 
                  onClick={(e) => { e.preventDefault(); void handleDisconnect(); }}
                  disabled={disconnecting || loading}
                  className="flex-1 bg-red-600 text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:bg-red-700 disabled:opacity-70 flex justify-center items-center"
                >
                  {disconnecting ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                     "Disconnect"
                  )}
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); handleConnect(); }}
                  disabled={loading || disconnecting}
                  className="flex-1 text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-70 flex justify-center items-center"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                     "Reconnect"
                  )}
                </button>
              </>
            ) : (
              <button 
                onClick={(e) => { e.preventDefault(); handleConnect(); }}
                disabled={loading}
                className="w-full text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-70 flex justify-center items-center"
                style={{ backgroundColor: COLORS.primary }}
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
          {[
            "How to get Facebook App ID",
            "Setting up Facebook Webhook",
            "Generating System User Access Token"
          ].map((topic, i) => (
            <button
              key={i}
              type="button"
              className="flex items-center justify-between rounded-[16px] bg-[#E2E8F0] px-4 py-3 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all hover:bg-[#D4DEE9] group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] group-hover:scale-110 transition-transform">
                   <Text weight="bold" className="text-white" size="custom" style={{ fontSize: '10px' }}>?</Text>
                </div>
                <Text weight="semibold" className="text-[#111827]" size="xs">{topic}</Text>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-y-0.5" strokeWidth={2.5} />
            </button>
          ))}
        </div>
    </div>
  );
};
