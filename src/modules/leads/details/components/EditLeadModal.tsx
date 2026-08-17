/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Edit2, ChevronDown, Loader2, FileText, Plus, Trash2 } from 'lucide-react';
import { Lead, LeadStatus } from '@/modules/leads/types/lead.types';
import { getAllAds } from '@/modules/ads/api/adsApi';
import { StaffService } from '@/modules/staffs/services/staff.service';
import { getUser } from '@/core/utils/auth';
import { SearchableDropdown } from '@/core/components/common/SearchableDropdown';
import { useFeedback } from '@/core/contexts/FeedbackContext';
import { Text } from '@/core/components/ui/Text';
import TextField from '@/core/components/ui/TextField';
import { COLORS } from '@/core/components/theme/colors';
import { leadsApi } from '@/modules/leads/api/leadsApi';
import { activityService } from '@/modules/activities/services/activityService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess?: () => void;
}

const LEAD_STATUSES: LeadStatus[] = [
  'New Lead',
  'Hot Lead',
  'Follow Up',
  'Contacted',
  'Closed',
  'Not Interested',
  'RNR',
  'Busy',
  'Switch Off',
  'Enrolled',
  'Register',
  'Disqualified',
  'Customer',
];

const LEAD_SOURCES = [
  'Manual',
  'Facebook',
  'Instagram',
  'WhatsApp',
  'Google Ads',
  'Website',
  'Other',
];

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { showToast } = useFeedback();

  const getInitialPhone = () => {
    const rawMobile = lead.mobileNumber || (lead.formData as Record<string, any> | undefined)?.contactNumber || (lead.formData as Record<string, any> | undefined)?.phone || '';
    if (!rawMobile) return '+91';
    return rawMobile.startsWith('+') ? rawMobile : `+${rawMobile}`;
  };

  const [formData, setFormData] = useState({
    userName: lead.userName || lead.name || '',
    email: lead.email || '',
    mobileNumber: getInitialPhone(),
    leadSource: lead.source || (lead.ad as any)?.platform || 'Manual',
    status: (lead.status || 'New Lead') as LeadStatus,
    adId: lead.ad?.adId || (lead as any)?.adId || '',
    staffId: lead.userId || lead.assignedUser?.id || (lead as any)?.assignedTo || '',
    type: (lead.formData as Record<string, any> | undefined)?.type || '',
  });

  // Extra editable formData fields (everything except internal/core fields)
  const SKIP_FORM_KEYS = ['full_name', 'phone_number', 'mobileNumber', 'userName', 'email', 'contactNumber', 'phone', 'type'];
  const getExtraFormFields = () => {
    const fd = (lead.formData as Record<string, any> | undefined) ?? {};
    return Object.entries(fd)
      .filter(([k]) => !SKIP_FORM_KEYS.some(s => k.toLowerCase().includes(s.toLowerCase())))
      .reduce<Record<string, string>>((acc, [k, v]) => {
        acc[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '');
        return acc;
      }, {});
  };

  const [extraFormFields, setExtraFormFields] = useState<Record<string, string>>(getExtraFormFields);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [showAddField, setShowAddField] = useState(false);

  const handleAddNewField = () => {
    if (!newFieldName.trim()) return;
    const formattedKey = newFieldName.trim().replace(/\s+/g, '_').toLowerCase();
    setExtraFormFields(prev => ({
      ...prev,
      [formattedKey]: newFieldValue.trim()
    }));
    setNewFieldName('');
    setNewFieldValue('');
    setShowAddField(false);
  };

  const handleRemoveField = (key: string) => {
    setExtraFormFields(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        userName: lead.userName || lead.name || '',
        email: lead.email || '',
        mobileNumber: getInitialPhone(),
        leadSource: lead.source || (lead.ad as any)?.platform || 'Manual',
        status: (lead.status || 'New Lead') as LeadStatus,
        adId: lead.ad?.adId || (lead as any)?.adId || '',
        staffId: lead.userId || lead.assignedUser?.id || (lead as any)?.assignedTo || '',
        type: (lead.formData as Record<string, any> | undefined)?.type || '',
      });
      setExtraFormFields(getExtraFormFields());
      setNewFieldName('');
      setNewFieldValue('');
      setShowAddField(false);
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, lead]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setFetchingData(true);
      try {
        const user = getUser<{ organizationId: string; role: string }>();
        if (!user || !user.organizationId) return;

        const [adsRes, staffRes] = await Promise.all([
          getAllAds({ organizationId: user.organizationId }).catch(() => []),
          StaffService.getAllStaff(user.organizationId, user.role).catch(() => ({ data: [] })),
        ]);

        setAds(adsRes || []);
        setStaff((staffRes as any)?.data || []);
      } catch (err) {
        console.error('Failed to fetch dropdown data for lead edit:', err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Full Name is required';
    }

    const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (cleanMobile.length < 7) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.leadSource) {
      newErrors.leadSource = 'Lead source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    setApiError(null);

    try {
      const mergedFormData: Record<string, unknown> = { ...extraFormFields };

      const response = await leadsApi.updateLead(lead.id, {
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.startsWith('+') ? formData.mobileNumber : `+${formData.mobileNumber}`,
        leadSource: formData.leadSource,
        status: formData.status,
        adId: formData.adId || undefined,
        staffId: formData.staffId || undefined,
        type: formData.type || undefined,
        formData: Object.keys(mergedFormData).length > 0 ? mergedFormData : undefined,
      });

      // Update session cache if exists
      try {
        if (response.data) {
          sessionStorage.setItem(`lead_cache_${lead.id}`, JSON.stringify(response.data));
        } else {
          sessionStorage.removeItem(`lead_cache_${lead.id}`);
        }
      } catch { }

      // Create activity for the update
      try {
        const user = getUser<{ id?: string; _id?: string }>();
        const userId = user?.id || user?._id || '';
        if (userId) {
          await activityService.createActivity(lead.id, {
            title: 'Lead Updated',
            description: `Lead details updated: ${[
              formData.userName !== (lead.userName || lead.name) && 'Name',
              formData.status !== lead.status && 'Status',
              formData.leadSource !== lead.source && 'Source',
              formData.type && 'Type',
            ].filter(Boolean).join(', ') || 'Details updated'}`,
            userId,
          });
        }
      } catch { /* activity creation is non-blocking */ }

      showToast('Lead updated successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const message = err?.message || 'Failed to update lead';
      setApiError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const adOptions = [
    { id: '', label: 'No Ad Campaign', subLabel: 'Direct / Organic' },
    ...ads.map(ad => ({
      id: ad.id || ad.adId,
      label: ad.adName || 'Unnamed Ad',
      subLabel: ad.platform || '',
    }))
  ];

  const staffOptions = [
    { id: '', label: 'Unassigned', subLabel: 'No staff assigned' },
    ...staff.map(s => ({
      id: s.id,
      label: s.userName || 'Unnamed Staff',
      subLabel: s.role || '',
    }))
  ];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(13,27,62,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F7F3]/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Edit2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <Text as="h3" weight="bold" className="text-gray-900" style={{ fontSize: '17px' }}>
                Edit Lead Details
              </Text>
              <Text className="text-gray-500 text-[12px] mt-0.5">
                Update contact, campaign, and assignment information
              </Text>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-gray-200">
          {apiError && (
            <div className="text-red-600 text-[12px] bg-red-50 p-2.5 rounded-xl border border-red-100 leading-normal">
              {apiError}
            </div>
          )}

          {fetchingData && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1C3A76]" />
              <span>Loading campaigns and staff members...</span>
            </div>
          )}

          <div>
            <label className="text-[12px] font-medium text-[#0D1B3E] mb-1 block">Full Name *</label>
            <TextField
              type="text"
              value={formData.userName}
              onChange={(e) => {
                setFormData({ ...formData, userName: e.target.value });
                if (errors.userName) setErrors({ ...errors, userName: '' });
              }}
              placeholder="Enter lead name"
              error={errors.userName}
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#0D1B3E] mb-1 block">Email Address</label>
            <TextField
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="example@gmail.com"
              error={errors.email}
            />
          </div>

          <div className="relative z-30">
            <label className="text-[12px] font-medium text-[#0D1B3E] mb-1 block">Mobile Number *</label>
            <div
              className="relative w-full h-[48px] bg-white rounded-[14px] flex items-center transition-all duration-200 border border-gray-200"
              style={{ boxShadow: errors.mobileNumber ? '0 0 0 2px #ef4444' : undefined }}
            >
              <PhoneInput
                country={'in'}
                value={formData.mobileNumber}
                onChange={(val) => {
                  setFormData({ ...formData, mobileNumber: val ? `+${val}` : '' });
                  if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
                }}
                enableSearch={true}
                countryCodeEditable={false}
                masks={{ in: '..........' }}
                searchPlaceholder="Search country..."
                inputClass="phone-input-lead-custom"
                containerClass="phone-container-lead-custom"
                buttonClass="phone-button-lead-custom"
                dropdownClass="phone-dropdown-lead-custom"
                searchClass="phone-search-lead-custom"
              />
            </div>
            {errors.mobileNumber && <span className="text-xs px-1 text-red-500 mt-1.5 block">{errors.mobileNumber}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[12px] font-medium text-[#0D1B3E] mb-1 block">Status</label>
              <div className="relative w-full h-[48px] bg-white rounded-[14px] border border-gray-200">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                  className="w-full h-full bg-transparent text-[#0D1B3E] appearance-none rounded-[14px] px-3.5 text-[14px] focus:outline-none transition-all"
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#0D1B3E] mb-1 block">Lead Source *</label>
              <div className="relative w-full h-[48px] bg-white rounded-[14px] border border-gray-200">
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                  className="w-full h-full bg-transparent text-[#0D1B3E] appearance-none rounded-[14px] px-3.5 text-[14px] focus:outline-none transition-all"
                >
                  {LEAD_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[12px] font-medium text-[#0D1B3E] mb-1 block">Lead Type</label>
              <div className="relative w-full h-[48px] bg-white rounded-[14px] border border-gray-200">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-full bg-transparent text-[#0D1B3E] appearance-none rounded-[14px] px-3.5 text-[14px] focus:outline-none transition-all"
                >
                  <option value="">Select Type</option>
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Business">Business</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <SearchableDropdown
              label="Ad Campaign"
              options={adOptions}
              value={formData.adId}
              onChange={(val) => setFormData({ ...formData, adId: val })}
              placeholder="Select Ad Campaign"
            />

            <SearchableDropdown
              label="Assign To Staff"
              options={staffOptions}
              value={formData.staffId}
              onChange={(val) => setFormData({ ...formData, staffId: val })}
              placeholder="Select Staff Member"
            />
          </div>

          {/* Editable extra form details & Add Field */}
          <div>
            <div className="flex items-center justify-between mb-3 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                Additional Details
              </div>
              {!showAddField && (
                <button
                  type="button"
                  onClick={() => setShowAddField(true)}
                  className="flex items-center gap-1 text-[12px] font-semibold text-[#1C3A76] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </button>
              )}
            </div>

            {/* List of existing extra fields */}
            {Object.keys(extraFormFields).length > 0 && (
              <div className="flex flex-col gap-3">
                {Object.entries(extraFormFields).map(([key, val]) => {
                  const label = key
                    .replace(/_/g, ' ')
                    .split(' ')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ');
                  return (
                    <div key={key} className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-[12px] font-medium text-[#0D1B3E] mb-1 block">{label}</label>
                        <TextField
                          type="text"
                          value={val}
                          onChange={(e) => setExtraFormFields(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(key)}
                        className="w-10 h-10 mb-1 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
                        title="Remove field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Form to add a new custom field */}
            {showAddField && (
              <div className="mt-3 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-3 animate-in fade-in duration-150">
                <Text weight="bold" className="text-[13px] text-gray-800">Add Custom Form Field</Text>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Field Name *</label>
                    <TextField
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g. City, Course, Budget"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Field Value</label>
                    <TextField
                      type="text"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddField(false);
                      setNewFieldName('');
                      setNewFieldValue('');
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewField}
                    disabled={!newFieldName.trim()}
                    className="px-3.5 py-1.5 text-xs text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    Add Field
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 text-[13px] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-white font-semibold text-[13px] transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm active:scale-[0.98]"
            style={{ backgroundColor: COLORS.primary }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
