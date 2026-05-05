"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ProfileService, UpdateProfileData } from "../services/profileService";

const BUSINESS_CATEGORIES = [
  "Automotive",
  "Accounting Services",
  "Courier Services",
  "Compliance Services",
  "Construction & Development",
  "Digital Marketing",
  "E-commerce",
  "Food & Beverage Production",
  "Film & Television Production",
  "Health Insurance",
  "Sales & Support",
  "Tutoring Services",
];

export default function ProfileForm() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === "Admin";
  
  const [formData, setFormData] = useState<UpdateProfileData>({
    userId: "",
    userName: "",
    email: "",
    mobileNumber: "",
    address: "",
    organization: {
      organizationName: "",
      businessCategory: "",
      startTime: "",
      endTime: ""
    }
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        userId: user.id || "",
        userName: user.userName || "",
        email: user.email || "",
        mobileNumber: (user as { mobileNumber?: string }).mobileNumber || "",
        address: (user as { address?: string }).address || "",
        organization: {
          organizationName: (user.organization as { organizationName?: string })?.organizationName || "",
          businessCategory: (user.organization as { businessCategory?: string })?.businessCategory || "",
          startTime: (user.organization as { startTime?: string })?.startTime || "09:00",
          endTime: (user.organization as { endTime?: string })?.endTime || "17:00",
        }
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("org_")) {
      const orgField = name.replace("org_", "");
      setFormData(prev => ({
        ...prev,
        organization: {
          ...prev.organization,
          [orgField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    
    try {
      await ProfileService.updateProfile(formData);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold bg-white text-gray-800 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed"
                readOnly
                title="Email cannot be changed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Business Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  name="org_organizationName"
                  value={formData.organization?.organizationName || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g ABC Company"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="org_startTime"
                    value={formData.organization?.startTime || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    name="org_endTime"
                    value={formData.organization?.endTime || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Business Location</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g 123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Business Category</label>
                <select
                  name="org_businessCategory"
                  value={formData.organization?.businessCategory || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="" disabled>--Select Category--</option>
                  {BUSINESS_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-lg text-sm font-medium ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
