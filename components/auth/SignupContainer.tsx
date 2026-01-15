"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Building2 } from "lucide-react";
import IndividualSignupForm from "./IndividualSignupForm";
import OrganizationSignupForm from "./OrganizationSignupForm";
import Button from "@/components/ui/Button";

type UserType = "individual" | "organization" | null;

export default function SignupContainer() {
  const [userType, setUserType] = useState<UserType>(null);
  const [showForm, setShowForm] = useState(false);

  const isDisabled = !userType;

  const buttonText = !userType
    ? "Signup"
    : `Signup as ${userType === "individual" ? "Individual" : "Organization"}`;

  const handleBack = () => {
    setShowForm(false);
    setUserType(null);
  };

  if (!showForm) {
    return (
      <div className="w-full max-w-4xl rounded-2xl bg-white p-10 shadow-lg border-t-4 border-b-4 border-primary">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="https://dummyimage.com/140x40/0092CB/ffffff&text=ANAD"
            alt="ANAD Logo"
            className="h-10 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-primary">
          Create your account
        </h1>
        <p className="mb-8 text-center text-md text-black">
          Choose how you want to sign up
        </p>

        {/* Cards */}
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Individual */}
          <button
            onClick={() => setUserType("individual")}
            className={`flex flex-1 items-center gap-4 rounded-xl bg-textField border p-6 transition md:flex-col md:text-center cursor-pointer
              ${
                userType === "individual"
                  ? "border-secondary"
                  : "border-transparent hover:border-secondary"
              }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
              <User size={26} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Individual
            </h2>
          </button>

          {/* Organization */}
          <button
            onClick={() => setUserType("organization")}
            className={`flex flex-1 items-center gap-4 rounded-xl bg-textField border p-6 transition md:flex-col md:text-center cursor-pointer
              ${
                userType === "organization"
                  ? "border-secondary"
                  : "border-transparent hover:border-secondary"
              }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
              <Building2 size={26} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Organization
            </h2>
          </button>
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Button disabled={isDisabled} onClick={() => setShowForm(true)}>
            {buttonText}
          </Button>
        </div>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {userType === "individual" ? (
        <IndividualSignupForm onBack={handleBack}/>
      ) : (
        <OrganizationSignupForm onBack={handleBack} />
      )}
    </div>
  );
}
