"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await authService.login(email, password);

      // store auth data
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg"
    >
      {/* Company Logo */}
      <div className="mb-6 flex justify-center">
        <img
          src="https://dummyimage.com/120x40/0092CB/ffffff&text=ANAD"
          alt="ANAD Logo"
          className="h-10 object-contain"
        />
      </div>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-black tracking-wide">
          Login to continue to your account
        </p>
      </div>

      {/* Email */}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 bg-textField"
      />

      {/* Password */}
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 bg-[#F1F4FF]"
      />

      {/* Forgot password */}
      <div className="mb-5 text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-[#0092CB] hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Login button */}
      <Button type="submit" className="mb-4">
        Login
      </Button>

      {/* Divider */}
      <div className="my-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Google Sign-in */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          className="h-5 w-5"
        />
        Sign in with Google
      </button>

      {/* Signup link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[#0092CB] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
