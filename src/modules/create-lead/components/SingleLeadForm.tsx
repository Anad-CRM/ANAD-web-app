/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { createSingleLead, CreateLeadPayload } from '../api/createLeadApi';
import { getAllAds } from '@/modules/ads/api/adsApi';
import { StaffService } from '@/modules/staffs/services/staff.service';
import { getUser } from '@/core/utils/auth';
import { SearchableDropdown } from '@/core/components/common/SearchableDropdown';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export const SingleLeadForm: React.FC = () => {
  const { showToast } = useFeedback();
  const [formData, setFormData] = useState<CreateLeadPayload>({
     userName: '',
     email: '',
     mobileNumber: '+91',
     leadSource: 'Manual',
     adId: '',
     staffId: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getUser<{ organizationId: string; role: string }>();
        if (!user || !user.organizationId) return;

        const [adsRes, staffRes] = await Promise.all([
          getAllAds({ organizationId: user.organizationId }),
          StaffService.getAllStaff(user.organizationId, user.role)
        ]);

        setAds(adsRes || []);
        setStaff((staffRes as any).data || []);
      } catch (err) {
        console.error("Failed to fetch form data", err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.userName.trim()) {
      newErrors.userName = "Full Name is required";
    }

    if (!formData.mobileNumber || formData.mobileNumber === '+') {
      newErrors.mobileNumber = "Mobile Number is required";
    } else if (formData.mobileNumber.length < 8) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.leadSource) {
      newErrors.leadSource = "Lead source is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validate()) return;

     setLoading(true);
     setApiError(null);
     try {
        const payloadWithId = {
          ...formData,
          leadId: Date.now().toString()
        };
        await createSingleLead(payloadWithId);
        showToast("Lead created successfully!", "success");
        setFormData({
           userName: '',
           email: '',
           mobileNumber: '+91',
           leadSource: 'Manual',
           adId: '',
           staffId: ''
        });
        setErrors({});
      } catch (err: any) {
         const message = err?.response?.data?.message || err.message || "Failed to create lead";
         setApiError(message);
         showToast(message, "error");
      } finally {
        setLoading(false);
     }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="w-8 h-8 border-4 border-[#1C3A76] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const adOptions = ads.map(ad => ({
    id: ad.adId,
    label: ad.adName || 'Unnamed Ad',
    subLabel: ad.platform || ''
  }));

  const staffOptions = staff.map(s => ({
    id: s.id,
    label: s.userName || 'Unnamed Staff',
    subLabel: s.role || ''
  }));

  return (
    <div className="flex flex-col pb-10">
      <h2 className="text-[15px] font-semibold text-black mb-3 tracking-wide">Lead Information</h2>
      {apiError && <p className="text-red-500 text-[11px] mb-2 bg-red-50 p-1.5 rounded-md border border-red-100">{apiError}</p>}
      
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Full Name *</label>
          <input 
            type="text" 
            value={formData.userName}
            onChange={(e) => {
              setFormData({...formData, userName: e.target.value});
              if (errors.userName) setErrors({...errors, userName: ''});
            }}
            placeholder="Enter lead name" 
            className={`w-full bg-[#2B5299] text-white placeholder-[#8DA8D6] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none shadow-sm border ${errors.userName ? 'border-red-400' : 'border-transparent'}`}
          />
          {errors.userName && <p className="text-[#C62828] text-[10px] font-medium mt-1 ml-1">{errors.userName}</p>}
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Email Address</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => {
              setFormData({...formData, email: e.target.value});
              if (errors.email) setErrors({...errors, email: ''});
            }}
            placeholder="jagan@mail.com" 
            className={`w-full bg-[#2B5299] text-white placeholder-[#8DA8D6] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none shadow-sm border ${errors.email ? 'border-red-400' : 'border-transparent'}`}
          />
          {errors.email && <p className="text-[#C62828] text-[10px] font-medium mt-1 ml-1">{errors.email}</p>}
        </div>

        <div className="z-[110]">
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Mobile Number *</label>
          <div className="relative w-full h-[44px] bg-[#2B5299] rounded-xl flex items-center shadow-sm">
            <PhoneInput
              country={"in"}
              value={formData.mobileNumber}
              onChange={(val) => {
                setFormData({...formData, mobileNumber: "+" + val});
                if (errors.mobileNumber) setErrors({...errors, mobileNumber: ''});
              }}
              enableSearch={true}
              countryCodeEditable={false}
              masks={{ in: ".........." }}
              searchPlaceholder="Search..."
              inputClass="phone-input-lead-custom"
              containerClass="phone-container-lead-custom"
              buttonClass="phone-button-lead-custom"
              dropdownClass="phone-dropdown-lead-custom"
              searchClass="phone-search-lead-custom"
            />
          </div>
          {errors.mobileNumber && <p className="text-[#C62828] text-[10px] font-medium mt-1 ml-1">{errors.mobileNumber}</p>}
          <style jsx global>{`
            .phone-container-lead-custom {
              width: 100% !important;
              height: 44px !important;
              border: none !important;
              overflow: visible !important;
            }
            .phone-input-lead-custom {
              width: 100% !important;
              height: 44px !important;
              background: #2B5299 !important;
              border: none !important;
              border-radius: 12px !important;
              font-family: inherit !important;
              font-size: 13px !important;
              color: white !important;
              padding-left: 55px !important;
            }
            .phone-input-lead-custom::placeholder {
              color: #8DA8D6 !important;
            }
            .phone-button-lead-custom {
              background: transparent !important;
              border: none !important;
              border-radius: 12px 0 0 12px !important;
              padding-left: 10px !important;
              width: 50px !important;
            }
            .phone-button-lead-custom:hover, .phone-button-lead-custom.open {
              background: rgba(255, 255, 255, 0.1) !important;
            }
            .phone-dropdown-lead-custom {
              width: 250px !important;
              border-radius: 12px !important;
              color: #0D1B3E !important;
              margin-top: 5px !important;
              z-index: 200 !important;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            }
          `}</style>
        </div>
      </div>

      <h2 className="text-[15px] font-semibold text-black mb-3 tracking-wide">Lead Details</h2>

      <div className="flex flex-col gap-5 mb-8">
        <div>
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Lead Source *</label>
          <div className="relative">
            <select 
               value={formData.leadSource}
               onChange={(e) => setFormData({...formData, leadSource: e.target.value})}
               className="w-full bg-[#2B5299] text-white appearance-none rounded-xl px-4 py-2.5 text-[13px] focus:outline-none shadow-sm"
            >
              <option value="Manual">Manual</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Website">Website</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-white pointer-events-none" />
          </div>
        </div>

        <SearchableDropdown
          label="Ad Campaign"
          options={adOptions}
          value={formData.adId || ''}
          onChange={(val) => setFormData({...formData, adId: val})}
          placeholder="Select Ad Campaign"
        />

        <SearchableDropdown
          label="Assign To"
          options={staffOptions}
          value={formData.staffId || ''}
          onChange={(val) => setFormData({...formData, staffId: val})}
          placeholder="Select Staff Member"
        />
      </div>

      <div className="flex justify-center mt-4">
        <button 
           onClick={handleSubmit}
           disabled={loading}
           className="bg-[#1C3A76] text-white text-[14px] font-medium px-10 py-3 rounded-xl hover:bg-[#11234D] disabled:opacity-70 transition-all shadow-md active:scale-[0.98] min-w-[200px] flex justify-center items-center h-[48px]"
        >
          {loading ? (
             <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Create Lead"
          )}
        </button>
      </div>
    </div>
  );
};
