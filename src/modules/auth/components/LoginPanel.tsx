"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Button from "@/core/components/ui/Button";
import TextField from "@/core/components/ui/TextField";
import { Text } from "@/core/components/ui/Text";

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
      <Text as="h2" weight="bold" size="lg" className="text-white mb-3 opacity-90 tracking-wide uppercase">
        User Login
      </Text>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 max-w-[380px]">
        <TextField
          type="email"
          placeholder="User Name"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<User size={16} />}
          className="rounded-full shadow-sm h-[42px]"
        />

        <div className="relative w-full">
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            className="rounded-full shadow-sm h-[42px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E56A0] transition-colors z-10"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex items-center justify-between px-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-3 h-3 rounded-sm border-white/40 bg-transparent text-[#1E56A0] focus:ring-0 cursor-pointer" 
            />
            <span className="text-[10px] text-white/80 group-hover:text-white transition-colors">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[10px] font-medium text-white/80 hover:text-white transition-all underline underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="text-[10px] text-red-300 text-center">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="white"
          size="md"
          disabled={isPending}
          className="mt-3 w-[180px] self-center rounded-full text-[#1E56A0] hover:scale-105 transition-transform font-bold"
        >
          {isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
