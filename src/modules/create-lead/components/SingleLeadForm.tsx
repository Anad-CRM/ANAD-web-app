/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { createSingleLead, CreateLeadPayload } from '../api/createLeadApi';
import { getAllAds } from '../../ads/api/adsApi';
import { StaffService } from '../../staffs/services/staff.service';
import { AdCampaign } from '../../ads/types';
import { Staff } from '../../staffs/types/staff.types';
import { getUser } from '@/core/utils/auth';

export const SingleLeadForm: React.FC = () => {
  const user = getUser<any>();
  const isStaffMember = user?.role === 'Staff Member';

  const [formData, setFormData] = useState<CreateLeadPayload>({
    userName: '',
    email: '',
    mobileNumber: '',
    leadSource: 'Manual',
    adId: '',
    staffId: isStaffMember ? String(user?.id || '') : ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const adsData = await getAllAds();
        setAds(adsData);

        if (!isStaffMember && user?.organizationId) {
          const staffResponse = await StaffService.getAllStaff(user.organizationId, user.role);
          if (staffResponse.status === 'success') {
            const validStaff = staffResponse.data.filter(s => s.userName && s.password);
            setStaffList(validStaff);
          }
        }
      } catch (error) {
        console.error("Failed to fetch ads or staff", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user?.organizationId, user?.role, isStaffMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.mobileNumber) {
      setError("Name and Mobile Number are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const submitData = {
        ...formData,
        mobileNumber: formData.mobileNumber.startsWith('+') ? formData.mobileNumber : `+91${formData.mobileNumber}`
      };
      await createSingleLead(submitData);
      alert("Lead created successfully!");
      setFormData({
        userName: '',
        email: '',
        mobileNumber: '',
        leadSource: 'Manual',
        adId: '',
        staffId: isStaffMember ? String(user?.id || '') : ''
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-[15px] font-semibold text-black mb-3 tracking-wide">Lead Information</h2>
      {error && <p className="text-red-500 text-[11px] mb-2 bg-red-50 p-1.5 rounded-md border border-red-100">{error}</p>}

      <div className="flex flex-col gap-3 mb-4">
        <div>
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Name</label>
          <input
            type="text"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            placeholder="Enter lead name"
            className="w-full bg-[#2B5299] text-white placeholder-[#8DA8D6] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none shadow-sm"
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jagan@mail.com"
            className="w-full bg-[#2B5299] text-white placeholder-[#8DA8D6] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none shadow-sm"
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Mobile Number</label>
          <div className="flex items-center w-full bg-[#2B5299] rounded-xl px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-2 border-r border-[#6F8BB5] pr-3 mr-3 h-4">
              <span className="text-[14px] leading-none mb-[1px]">🇮🇳</span>
              <span className="text-white text-[13px] font-medium">+91</span>
            </div>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              placeholder="Enter Phone number"
              className="flex-1 bg-transparent text-white placeholder-[#8DA8D6] text-[13px] focus:outline-none h-full"
            />
          </div>
        </div>
      </div>

      <h2 className="text-[15px] font-semibold text-black mb-3 tracking-wide">Lead Details</h2>

      <div className="flex flex-col gap-3 mb-6">
        <div>
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Lead Source</label>
          <div className="relative">
            <select
              value={formData.leadSource}
              onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              className="w-full bg-[#2B5299] text-[#8DA8D6] appearance-none rounded-xl px-4 py-2.5 text-[13px] focus:outline-none shadow-sm"
            >
              <option value="Manual">Manual</option>
              <option value="Facebook">Facebook</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Website">Website</option>
              <option value="Others">Others</option>

            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-white pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Ad Campaign</label>
          <div className="relative">
            <select
              value={formData.adId}
              onChange={(e) => setFormData({ ...formData, adId: e.target.value })}
              className="w-full bg-[#2B5299] text-[#8DA8D6] appearance-none rounded-xl px-4 py-2.5 text-[13px] focus:outline-none shadow-sm"
              disabled={loadingData || ads.length === 0}
            >
              <option value="">{loadingData ? 'Loading...' : ads.length === 0 ? 'No ads available' : 'Select Ad'}</option>
              {ads.map(ad => (
                <option key={ad.adId} value={ad.adId}>{ad.adName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-white pointer-events-none" />
          </div>
        </div>

        {!isStaffMember && (
          <div>
            <label className="text-[12px] font-medium text-[#1A1A1A] mb-1 block">Assign To</label>
            <div className="relative">
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full bg-[#2B5299] text-[#8DA8D6] appearance-none rounded-xl px-4 py-2.5 text-[13px] focus:outline-none shadow-sm"
                disabled={loadingData || staffList.length === 0}
              >
                <option value="">{loadingData ? 'Loading...' : staffList.length === 0 ? 'No staff available' : 'Select Staff'}</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={String(staff.id)}>{staff.userName}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-white pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#1C3A76] text-white text-[14px] font-medium px-10 py-2.5 rounded-xl hover:bg-[#11234D] disabled:opacity-70 transition-colors shadow-sm tracking-wide min-w-[180px] flex justify-center items-center h-[44px]"
        >
          {loading ? (
            <div className="w-4 h-4 border-[2px] border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Create Lead"
          )}
        </button>
      </div>
    </div>
  );
};
