import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "white" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#163172] text-white hover:bg-[#0D1B3E] focus:ring-[#163172]",
    secondary: "bg-[#1E56A0] text-white hover:bg-[#163172] focus:ring-[#1E56A0]",
    white: "bg-white text-[#1E56A0] hover:bg-gray-100 focus:ring-gray-200 shadow-lg",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white/10 focus:ring-white",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-12 px-8 text-base",
    xl: "h-14 px-10 text-lg",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
