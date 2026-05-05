import React, { useState } from 'react';
import { X, ExternalLink, Send } from 'lucide-react';
import { Whatsapp } from '@thesvg/react';
import { activityService } from "@/modules/activities/services/activityService";
import { getUser } from '@/core/utils/auth';

interface Props {
  leadId: string;
  leadName: string;
  phoneNumber: string;
  organizationName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const WhatsAppTemplateModal: React.FC<Props> = ({ leadId, leadName, phoneNumber, organizationName = 'our organization', onClose, onSuccess }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [error, setError] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<{title: string, message: string} | null>(null);

  const templates = [
    {
      title: "Initial Contact",
      message: `Hello ${leadName},\n\nI hope you are doing well. I noticed your interest in ${organizationName}.\n\nI would like to discuss how we can assist you. Please let me know a convenient time to connect.\n\nThank you.`
    },
    {
      title: "Meeting Request",
      message: `Hello ${leadName},\n\nI hope you are doing well. I would like to check your availability for a short meeting tomorrow at 11:00 AM.\n\nThis will help us better understand your requirements at ${organizationName}.\n\nPlease let me know if the time works for you.`
    },
    {
      title: "Follow Up",
      message: `Hello ${leadName},\n\nI am following up regarding our previous discussion. Please let me know if you had a chance to review the information shared.\n\nFeel free to reach out if you need any clarification.\n\nThank you.`
    },
    {
      title: "Product Details",
      message: `Hello ${leadName},\n\nThank you for showing interest in our products and services.\n\nI can share the detailed information and pricing with you. Please let me know if you would prefer a call or the details via WhatsApp.\n\nLooking forward to your response.`
    },
    {
      title: "Closing Follow-Up",
      message: `Hello ${leadName},\n\nI hope you had the opportunity to review the details and pricing shared earlier.\n\nI look forward to your response and to supporting ${organizationName}.\n\nPlease feel free to contact me if you have any questions.\n\nRegards`
    },
  ];

  const sanitizePhone = (phone: string) => {
    let p = phone || '';
    if (p.startsWith('p:')) p = p.substring(2);
    return p.replace(/[^0-9+]/g, '');
  };

  const handleSend = async (message: string) => {
    try {
      const userData = getUser<Record<string, string>>();
      const userId = userData?.id || '';

      // Log the activity
      await activityService.createActivity(leadId, {
        title: 'Whatsapp',
        description: message,
        userId,
      });

      // Open WhatsApp
      const cleanPhone = sanitizePhone(phoneNumber);
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');

      onSuccess();
      onClose();
    } catch (e) {
      console.error("Failed to log whatsapp activity", e);
    }
  };

  const handleCustomSend = () => {
    if (!customMessage.trim()) {
      setError(true);
      return;
    }
    handleSend(customMessage.trim());
  };

  const handleOpenDirectly = () => {
    const cleanPhone = sanitizePhone(phoneNumber);
    const url = `https://wa.me/${cleanPhone}`;
    window.open(url, '_blank');
    onClose();
  };

  if (previewTemplate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]" onClick={() => setPreviewTemplate(null)}>
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
            <div className="text-green-500"><Whatsapp width={24} height={24} /></div>
            <span className="text-[16px] font-semibold text-slate-800">{previewTemplate.title}</span>
          </div>
          <div className="p-6 bg-slate-50">
            <p className="text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed">{previewTemplate.message}</p>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
            <button onClick={() => setPreviewTemplate(null)} className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Close</button>
            <button onClick={() => handleSend(previewTemplate.message)} className="px-4 py-2 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2">
              <Send size={16} /> Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <span className="text-[18px] font-semibold text-slate-800">Select WhatsApp Template</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Custom Message Box */}
          <div className={`p-4 rounded-xl border ${error ? 'border-red-300 bg-red-50/30' : 'border-green-200 bg-green-50/30'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-green-600"><Whatsapp width={20} height={20} /></div>
              <span className="text-[14px] font-semibold text-slate-800">Write Your Message</span>
            </div>
            <textarea
              className={`w-full h-24 p-3 rounded-lg border ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-green-200'} focus:outline-none focus:ring-2 bg-white text-[14px] resize-none`}
              placeholder="Type your message here..."
              value={customMessage}
              onChange={(e) => {
                setCustomMessage(e.target.value);
                if (error && e.target.value.trim()) setError(false);
              }}
            />
            {error && <span className="text-[12px] text-red-500 font-medium mt-1 block">Please enter a message to continue</span>}
            
            <button onClick={handleCustomSend} className="w-full mt-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-[13px] transition-colors">
              Send via WhatsApp
            </button>
            <button onClick={handleOpenDirectly} className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-green-700 hover:bg-green-100/50 rounded-lg font-medium text-[13px] transition-colors">
              Or open WhatsApp directly <ExternalLink size={14} />
            </button>
          </div>

          <div>
            <span className="text-[13px] font-medium text-slate-500 mb-3 block">Choose a template</span>
            <div className="flex flex-col gap-2">
              {templates.map((t, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => handleSend(t.message)}>
                  <div className="text-green-500 mt-0.5"><Whatsapp width={24} height={24} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[14px] font-semibold text-slate-800">{t.title}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t); }}
                        className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded"
                      >
                        Preview
                      </button>
                    </div>
                    <p className="text-[12px] text-slate-500 line-clamp-2">{t.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
