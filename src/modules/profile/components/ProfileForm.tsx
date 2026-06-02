"use client";

import { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ProfileService, UpdateProfileData } from "../services/profileService";
import { Text } from "@/core/components/ui/Text";
import Button from "@/core/components/ui/Button";
import TextField from "@/core/components/ui/TextField";
import { COLORS } from "@/core/components/theme/colors";
import Image from "next/image";
import { User } from "../types";

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

const convertTo24Hour = (timeStr: string) => {
  if (!timeStr || typeof timeStr !== 'string') return "09:00";
  const trimmed = timeStr.trim().toUpperCase();
  if (!trimmed.includes("AM") && !trimmed.includes("PM")) {
    return trimmed.length > 5 ? trimmed.slice(0, 5) : trimmed;
  }
  
  const [time, modifier] = trimmed.split(" ");
  if (!time) return "09:00";
  const [hours, minutes = "00"] = time.split(":");
  let h = parseInt(hours, 10);
  if (modifier === "PM" && h < 12) h += 12;
  if (modifier === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

const convertTo12Hour = (timeStr: string) => {
  if (!timeStr) return "09:00 AM";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const modifier = h >= 12 ? "PM" : "AM";
  const h12 = (h % 12) || 12;
  return `${h12.toString().padStart(2, "0")}:${minutes} ${modifier}`;
};

export default function ProfileForm() {
  const { user, updateUser } = useAuth();
  
  const isAdmin = user?.role === "Admin";
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<UpdateProfileData>({
    userId: "",
    userName: "",
    email: "",
    mobileNumber: "",
    address: "",
    organizationName: "",
    businessCategory: "",
    startTime: "",
    endTime: ""
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      const typedUser = user as User;
      const org = typedUser.organization;

      setFormData({
        userId: typedUser.id ?? "",
        userName: typedUser.userName ?? "",
        email: typedUser.email ?? "",
        mobileNumber: typedUser.mobileNumber ?? "",
        address: typedUser.address ?? "",
        organizationName: org?.organizationName ?? typedUser.organizationName ?? "",
        businessCategory: org?.businessCategory ?? typedUser.businessCategory ?? "",
        startTime: convertTo24Hour(org?.startTime ?? typedUser.startTime ?? "09:00 AM"),
        endTime: convertTo24Hour(org?.endTime ?? typedUser.endTime ?? "05:00 PM"),
      });
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    
    try {
      let avatarUrl = (user as User)?.avatar || "avatar.png";
      
      if (avatarFile) {
        try {
          const base64Data = await getBase64(avatarFile);
          const fileContent = JSON.stringify(base64Data);
          const mediaRes = await ProfileService.uploadMedia({ 
            name: avatarFile.name.replace(/\s+/g, ""), 
            file: fileContent 
          });
          if (mediaRes && mediaRes.status === "success") {
            avatarUrl = mediaRes.data;
          }
        } catch (uploadErr) {
          console.error("Avatar upload failed:", uploadErr);
        }
      }

      const payload: UpdateProfileData = {
        userId: formData.userId,
        userName: formData.userName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        organizationName: formData.organizationName,
        businessCategory: formData.businessCategory,
        startTime: convertTo12Hour(formData.startTime || "09:00"),
        endTime: convertTo12Hour(formData.endTime || "17:00"),
        avatar: avatarUrl
      };

      const response = await ProfileService.updateProfile(payload);
      
      if (response && response.status === "success") {
        if (response.data) {
          updateUser(response.data);
        }
        setMessage("Profile updated successfully");
      } else {
        setMessage(response?.message || "Failed to update profile. Please check all fields.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message || "An error occurred while saving profile");
      } else {
        setMessage("An error occurred while saving profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-black/5">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="relative w-[120px] h-[120px] rounded-full border-4 border-[#1E56A0]/20 overflow-hidden bg-gray-100 flex items-center justify-center">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Profile" fill className="object-cover" unoptimized />
              ) : (user as User)?.avatar ? (
                <Image 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${(user as User).avatar}`} 
                  alt="Profile" 
                  fill
                  className="object-cover" 
                  unoptimized
                  onError={(e) => { 
                    e.currentTarget.style.display='none'; 
                    e.currentTarget.parentElement?.classList.add('fallback') 
                  }} 
                />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#1E56A0] rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-[#15427d] transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div className="mt-4 text-center">
            <Text as="h3" size="2xl" weight="bold" className="text-gray-900">
              {user?.userName || "User"}
            </Text>
            <Text size="sm" className="text-gray-600 mt-1">
              {user?.role || "Role"}
            </Text>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#1E56A0]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1E56A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <Text as="h2" size="xl" weight="bold" className="text-gray-900">Personal Information</Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField
              label="Name"
              name="userName"
              value={formData.userName || ""}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
            
            <TextField
              label="Email"
              name="email"
              value={formData.email || ""}
              readOnly
              disabled
              className="bg-gray-50 text-gray-400"
              title="Email cannot be changed"
            />

            <TextField
              label="Mobile Number"
              name="mobileNumber"
              type="tel"
              value={formData.mobileNumber || ""}
              onChange={handleChange}
              placeholder="e.g. +1 234 567 890"
              required
            />
          </div>
        </div>

        {isAdmin && (
          <div className="pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#1E56A0]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1E56A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <Text as="h2" size="xl" weight="bold" className="text-gray-900">Business Information</Text>
            </div>
            
            <div className="space-y-5">
              <TextField
                label="Organization Name"
                name="organizationName"
                value={formData.organizationName || ""}
                onChange={handleChange}
                placeholder="e.g ABC Company"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label="Start Time"
                  type="time"
                  name="startTime"
                  value={formData.startTime || ""}
                  onChange={handleChange}
                />
                <TextField
                  label="End Time"
                  type="time"
                  name="endTime"
                  value={formData.endTime || ""}
                  onChange={handleChange}
                />
              </div>

              <TextField
                label="Business Location"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                placeholder="e.g 123 Main Street"
              />

              <div className="flex flex-col gap-2 w-full">
                <Text size="xs" weight="semibold" className="text-gray-700 px-1 uppercase tracking-wider">
                  Business Category
                </Text>
                <select
                  name="businessCategory"
                  value={formData.businessCategory || ""}
                  onChange={handleChange}
                  className="w-full h-[48px] px-4 rounded-[14px] bg-white text-[15px] text-[#0D1B3E] border border-gray-200 outline-none transition-all duration-200 focus:border-[#1E56A0] focus:ring-1 focus:ring-[#1E56A0]/10 hover:border-gray-300"
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
          <div className={clsx(
            "p-4 rounded-xl text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2",
            message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}>
            {message}
          </div>
        )}

        <div className="pt-6 border-t border-gray-100">
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            size="lg"
            className="w-full !h-12 !rounded-xl !text-base"
            style={{ backgroundColor: COLORS.primary }}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
