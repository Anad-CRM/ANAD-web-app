"use client";

import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;       // left icon
  rightIcon?: ReactNode;  // right icon (eye)
}

export default function Input({
  icon,
  rightIcon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="relative w-full">
      {/* Left Icon */}
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}

      {/* Right Icon */}
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {rightIcon}
        </span>
      )}

      <input
        {...props}
        className={`
          w-full
          rounded-lg
          bg-textField
          p-4
          outline-none
          focus:ring-2
          focus:ring-blue-500
          ${icon ? "pl-10" : ""}
          ${rightIcon ? "pr-10" : ""}
          ${className}
        `}
      />
    </div>
  );
}
