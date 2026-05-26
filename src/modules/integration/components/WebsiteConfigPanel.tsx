import React, { useState } from 'react';
import { Copy, Trash2, RefreshCw, Eye, EyeOff, ChevronDown, Rocket } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import Button from '@/core/components/ui/Button';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import { generateSecretKey, disconnectSecretKey } from '../api/integrationApi';

interface Props {
  activeIndex: number;
  total: number;
}

export const WebsiteConfigPanel: React.FC<Props> = ({ activeIndex, total }) => {
  const { user } = useAuthContext();
  const secretKey = user?.organization?.secretKey;
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const { showToast } = useFeedback();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateSecretKey();
      showToast(secretKey ? "Key regenerated successfully" : "Key generated successfully", "success");
    } catch (err) {
      showToast("Failed to generate key", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!secretKey) return;
    setLoading(true);
    try {
      await disconnectSecretKey(secretKey);
      showToast("Website integration disconnected", "success");
    } catch (err) {
      showToast("Failed to disconnect", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      showToast("Secret key copied to clipboard", "success");
    }
  };

  return (
    <div 
      className={`p-5 lg:p-6 flex h-full w-full flex-col shadow-sm transition-all xl:pl-[40px] animate-slide-up-fade ${
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
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-white"
        >
          <img src="/website.png" alt="Website" className="w-7 h-7 object-contain" />
        </div>
        <div>
          <Text as="h2" weight="bold" className="text-white mb-1" style={{ fontSize: '17px', lineHeight: '1.25' }}>
            Website & Webhooks
          </Text>
          <Text weight="medium" className="text-white/80" size="xs">
            Receive leads from Website, LMS or any other source by using APIs
          </Text>
        </div>
      </div>

      <div className="p-4 lg:p-5 flex flex-col gap-4 bg-[#E2E8F0] rounded-[24px]">
        {secretKey ? (
          <div className="space-y-4">
            <div className="bg-white rounded-[16px] p-4 shadow-[0_6px_16px_rgba(15,23,42,0.06)] border border-transparent">
              <Text as="label" weight="bold" className="text-gray-400 uppercase tracking-wider mb-1 block text-left" size="custom" style={{ fontSize: '11px' }}>Your Unique Secret Key</Text>
              <div className="flex items-center justify-between gap-1">
                <input 
                  type={showKey ? "text" : "password"}
                  value={secretKey}
                  readOnly
                  className="text-sm font-mono text-gray-700 bg-transparent flex-1 focus:outline-none py-1"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                  title={showKey ? "Hide Key" : "Show Key"}
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                  title="Copy Key"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 h-[44px] rounded-full border-2 border-gray-300 text-gray-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Regenerate Key
              </button>
              <button 
                onClick={handleDisconnect}
                disabled={loading}
                className="w-[44px] h-[44px] rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all disabled:opacity-50"
                title="Disconnect"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <Rocket size={32} className="text-gray-300" />
            </div>
            <Text as="h3" weight="bold" className="text-gray-800 mb-1">Scale your integration</Text>
            <Text weight="normal" className="text-gray-500 mb-5 max-w-[200px]" size="custom" style={{ fontSize: '12px' }}>Generate a secret key to start receiving leads directly from your website.</Text>
            <Button 
              variant="primary"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full text-white h-[48px] rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Generate Secret Key"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-5">
        {[
          "How to integrate API",
          "Webhook security best practices",
          "Testing your website integration"
        ].map((topic, i) => (
          <button
            key={i}
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
