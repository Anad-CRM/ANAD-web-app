import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { User, Lock, Eye, EyeOff, UserCircle } from "lucide-react";
import Button from "@/core/components/ui/Button";
import TextField from "@/core/components/ui/TextField";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { getCredentials, getRememberMe, getSavedAccounts, type SavedAccount } from "@/core/utils/auth";

interface LoginPanelProps {
  onCreateAccount: () => void;
}

export default function LoginPanel({ onCreateAccount }: LoginPanelProps) {
  const { login, isPending, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAccounts, setFilteredAccounts] = useState<SavedAccount[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const isRemembered = getRememberMe();
    if (isRemembered) {
      setRememberMe(true);
      const creds = getCredentials();
      if (creds) {
        setEmail(creds.email);
        setPassword(creds.password);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getOrCreate(key: string, generate: () => string): string {
    if (typeof window === "undefined") return "";
    let val = localStorage.getItem(key);
    if (!val) { val = generate(); localStorage.setItem(key, val); }
    return val;
  }

  function generateUUID() {
    return typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
  }

  function handleEmailChange(val: string) {
    setEmail(val);
    if (emailError) setEmailError(null);
    
    if (val.trim()) {
      const saved = getSavedAccounts();
      const filtered = saved.filter(acc => 
        acc.email.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredAccounts(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectAccount(account: SavedAccount) {
    setEmail(account.email);
    setPassword(account.password);
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setShowSuggestions(false);

    const deviceId = getOrCreate("deviceId", generateUUID);
    const signinId = getOrCreate("signinId", generateUUID);
    const fcmToken = getOrCreate("fcmToken", () => "web-token-" + generateUUID());

    try {
      await login({
        email,
        password,
        platform: "web",
        token: fcmToken,
        deviceId,
        signinId,
        rememberMe,
      });
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("password")) {
        setPasswordError(err.message || "Invalid password");
      } else if (msg.includes("email") || msg.includes("not registered") || msg.includes("not found")) {
        setEmailError(err.message || "Email not found");
      }
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Text 
        as="h2" 
        weight="semibold"
        style={{ fontSize: '19.31px', lineHeight: '19.31px', color: COLORS.surface }}
        className="opacity-100 tracking-normal mb-6 sm:mb-8"
      >
        User Login
      </Text>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-5 items-center">
        <div className="w-full max-w-[350px] relative" ref={suggestionRef}>
          <TextField
            type="email"
            placeholder="User Name"
            required
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onFocus={() => {
              if (email.trim()) {
                const saved = getSavedAccounts();
                const filtered = saved.filter(acc => acc.email.toLowerCase().includes(email.toLowerCase()));
                if (filtered.length > 0) {
                  setFilteredAccounts(filtered);
                  setShowSuggestions(true);
                }
              }
            }}
            error={emailError || undefined}
            icon={<User size={18} color={emailError ? COLORS.danger : "#5E5E5E"} strokeWidth={2.5} />}
            className="rounded-full shadow-sm h-[56px] sm:h-[64px] text-[14px] sm:text-[15px]"
          />
          
          {showSuggestions && (
            <div className="absolute top-[110%] left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
              {filteredAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectAccount(acc)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-none"
                >
                  <UserCircle size={20} className="text-[#1E56A0] opacity-70" />
                  <div className="flex flex-col">
                    <Text as="span" weight="medium" className="text-[13px] text-[#0D1B3E] truncate max-w-[200px]">
                      {acc.email}
                    </Text>
                    <Text as="span" className="text-[10px] text-gray-400">
                      Saved account
                    </Text>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full max-w-[350px]">
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError || undefined}
            icon={<Lock size={18} color={passwordError ? COLORS.danger : "#5E5E5E"} strokeWidth={2.5} />}
            className="rounded-full shadow-sm h-[56px] sm:h-[64px] text-[14px] sm:text-[15px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5E5E5E] hover:text-[#1E56A0] transition-colors z-10 bg-transparent border-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between w-full max-w-[350px] px-2 mt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
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

        {authError && !emailError && !passwordError && (
          <Text as="p" className="text-[10px] text-center px-4" style={{ color: COLORS.danger }}>
            {authError}
          </Text>
        )}

        <Button
          type="submit"
          disabled={isPending}
          variant="white"
          className="mt-4 sm:mt-6 w-full max-w-[200px] h-[46px] sm:h-[50px] !font-medium font-poppins transition-all flex items-center justify-center !text-[#5E5E5E]"
          style={{ fontSize: '15px' }}
        >
          {isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
