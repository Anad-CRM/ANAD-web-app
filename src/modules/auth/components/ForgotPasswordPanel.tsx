"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import TextField from "@/core/components/ui/TextField";
import { Text } from "@/core/components/ui/Text";
import Button from "@/core/components/ui/Button";
import { COLORS } from "@/core/components/theme/colors";
import { authService } from "@/modules/auth/services/auth.service";

export default function ForgotPasswordPanel() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full h-full justify-center min-h-[260px]">
      {!sent ? (
        <>
          <Text 
            as="h2" 
            weight="semibold"
            style={{ fontSize: '19.31px', lineHeight: '19.31px', color: COLORS.surface }}
            className="opacity-100 tracking-normal mb-[35px]"
          >
            Forgot Password
          </Text>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 items-center">
            <div className="w-[350px]">
              <TextField
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} color="#5E5E5E" strokeWidth={2.5} />}
                className="rounded-full shadow-sm h-[64px] text-[15px]"
              />
            </div>
            
            <Text 
              as="p"
              style={{ fontSize: '13px', lineHeight: '1.4', color: 'rgba(255,255,255,0.8)' }}
              className="font-poppins text-center w-[350px] mb-1"
            >
              Enter your email address and we'll send you a reset link.
            </Text>

            {error && (
              <Text as="p" className="text-[12px] text-red-300 text-center -mt-2">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              disabled={isPending}
              variant="white"
              className="mt-6 w-[200px] h-[50px] !font-medium font-poppins transition-all flex items-center justify-center !text-[#5E5E5E] whitespace-nowrap"
              style={{ fontSize: '15px' }}
            >
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 w-[350px]" style={{ color: COLORS.surface }}>
          <div className="w-[64px] h-[64px] bg-white rounded-full flex items-center justify-center shadow-lg mb-2">
            <CheckCircle2 size={32} color={COLORS.primary} strokeWidth={2.5} />
          </div>
          <Text 
            as="h2" 
            weight="semibold"
            style={{ fontSize: '19.31px', lineHeight: '19.31px' }}
          >
            Check your inbox!
          </Text>
          <Text 
            as="p"
            className="text-center font-poppins"
            style={{ fontSize: '14px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)' }}
          >
            We have sent a password reset link to <br/>
            <strong>{email}</strong>
          </Text>
        </div>
      )}
    </div>
  );
}
