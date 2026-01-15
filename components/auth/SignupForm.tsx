"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow">
      <h1 className="text-2xl font-semibold text-primary mb-4">Sign Up</h1>

      <Input
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button>Create Account</Button>
    </div>
  );
}
