/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { KeyRound, Eye, ClipboardList, ChevronDown } from 'lucide-react';
import { connectWhatsAppIntegration } from '../api/integrationApi';

export const WhatsAppConfigPanel: React.FC = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!token.trim()) {
       setError("Access Token is required");
       return;
    }
    
    setLoading(true);
    setError(null);
    try {
       await connectWhatsAppIntegration({
           whatsappBusinessAccountId: "DUMMY_ACCOUNT_ID",
           phoneNumberId: "DUMMY_PHONE_ID",
           displayPhoneNumber: "DUMMY_PHONE",
           accessToken: token
       });
       setToken("");
       alert("WhatsApp integration successfully saved!"); 
    } catch (err: any) {
       setError(err?.response?.data?.message || err.message || "Failed to connect integration");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="bg-[#2B5299] rounded-3xl p-6 lg:p-8 flex flex-col gap-5 shadow-sm">
      <div className="bg-[#E5ECF4] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 13.96 2.56 15.78 3.53 17.33L2 22L6.87 20.49C8.36 21.46 10.11 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.15 15.68C16.92 16.32 15.82 16.85 15.17 16.96C14.65 17.05 13.9 17.16 11.45 16.14C8.5 14.92 6.58 11.9 6.43 11.69C6.28 11.49 5.2 10.05 5.2 8.56C5.2 7.07 5.96 6.34 6.27 6.03C6.58 5.72 7.04 5.6 7.42 5.6C7.54 5.6 7.65 5.61 7.75 5.61C8.06 5.61 8.21 5.63 8.42 6.13C8.65 6.68 9.22 8.08 9.29 8.23C9.37 8.38 9.45 8.58 9.33 8.81C9.22 9.04 9.14 9.15 8.95 9.35C8.76 9.56 8.57 9.82 8.4 9.98C8.21 10.16 8.02 10.36 8.24 10.74C8.46 11.12 9.2 12.33 10.3 13.31C11.72 14.58 12.87 14.98 13.29 15.15C13.71 15.32 13.94 15.3 14.17 15.06C14.4 14.82 15.06 14 15.32 13.62C15.59 13.24 15.86 13.31 16.24 13.44C16.63 13.57 18.06 14.28 18.37 14.43C18.67 14.58 18.86 14.66 18.94 14.79C19.01 14.92 19.01 15.53 18.78 16.17V15.68H17.15Z" fill="white"/>
          </svg>
        </div>
        <span className="text-[#1A1A1A] text-[15px] font-medium tracking-wide">WhatsApp Business API</span>
      </div>

      <div className="bg-[#E5ECF4] rounded-3xl p-5 lg:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-black" strokeWidth={2.5} />
          <h3 className="text-[#1A1A1A] text-[15px] font-semibold tracking-wide">Access Token</h3>
        </div>

        <div className="relative">
          <input
            type="text"
            value={token}
            onChange={(e) => { setToken(e.target.value); setError(null); }}
            placeholder="paste your permanent access"
            className={`w-full bg-white rounded-xl py-3.5 px-4 pr-16 text-sm focus:outline-none placeholder:text-[#64748B] text-black shadow-sm ${error ? 'border border-red-500' : ''}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-black cursor-pointer" strokeWidth={2.5} />
            <ClipboardList className="w-5 h-5 text-black cursor-pointer" strokeWidth={2} />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-xs font-medium px-1">{error}</p>}

        <button 
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-[#1C3A76] text-white py-3.5 rounded-[14px] text-[15px] font-medium transition-colors hover:bg-[#11234D] disabled:opacity-70 flex justify-center items-center h-[52px]"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
             "Connect WhatsApp Business"
          )}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#E5ECF4] rounded-xl px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#D9E3F0] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                 <span className="text-white text-[10px] font-bold">?</span>
              </div>
              <span className="text-[#1A1A1A] text-[14px] font-medium">How to create Access taken</span>
            </div>
            <ChevronDown className="w-5 h-5 text-black" strokeWidth={2} />
          </div>
        ))}
      </div>
    </div>
  );
};
