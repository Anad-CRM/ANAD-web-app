"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Button from "@/core/components/ui/Button";
import TextField from "@/core/components/ui/TextField";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

interface LoginPanelProps {
  onCreateAccount: () => void;
}

export default function LoginPanel({ onCreateAccount }: LoginPanelProps) {
  const { login, isPending, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function getOrCreate(key: string, generate: () => string): string {
    if (typeof window === "undefined") return "";
    let val = localStorage.getItem(key);
    if (!val) { val = generate(); localStorage.setItem(key, val); }
    return val;
  }

  function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const deviceId = getOrCreate("deviceId", generateUUID);
    const signinId = getOrCreate("signinId", generateUUID);
    const fcmToken = getOrCreate("fcmToken", () => "web-token-" + generateUUID());
    await login({
      email,
      password,
      platform: "web",
      token: fcmToken,
      deviceId,
      signinId,
    });
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Text 
        as="h2" 
        weight="semibold"
        style={{ fontSize: '19.31px', lineHeight: '19.31px', color: COLORS.surface }}
        className="opacity-100 tracking-normal mb-8"
      >
        User Login
      </Text>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 items-center">
        <div className="w-[350px]">
          <TextField
            type="email"
            placeholder="User Name"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<User size={18} color="#5E5E5E" strokeWidth={2.5} />}
            className="rounded-full shadow-sm h-[64px] text-[15px]"
          />
        </div>

        <div className="relative w-[350px]">
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} color="#5E5E5E" strokeWidth={2.5} />}
            className="rounded-full shadow-sm h-[64px] text-[15px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5E5E5E] hover:text-[#1E56A0] transition-colors z-10 bg-transparent border-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between w-[350px] px-2 mt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-3.5 h-3.5 rounded-sm border-white/40 bg-transparent text-[#1E56A0] focus:ring-0 cursor-pointer" 
            />
            <Text 
              as="span"
              weight="medium"
              className="text-white/80 group-hover:text-white transition-colors font-poppins"
              style={{ fontSize: '13px', lineHeight: '12px' }}
            >
              Remember me
            </Text>
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-white/80 hover:text-white transition-all font-poppins"
            style={{ fontSize: '13px', lineHeight: '12px' }}
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <Text as="p" className="text-[10px] text-center" style={{ color: COLORS.danger }}>
            {error}
          </Text>
        )}

        <Button
          type="submit"
          disabled={isPending}
          variant="white"
          className="mt-6 w-[200px] h-[50px] !font-medium font-poppins transition-all flex items-center justify-center !text-[#5E5E5E]"
          style={{ fontSize: '15px' }}
        >
          {isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
