import React from "react";
import { clsx } from "clsx";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  containerClassName?: string;
}

export default function TextField({
  label,
  icon,
  error,
  containerClassName,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className={clsx("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <label className="text-[13px] font-semibold text-white/90 px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-10 top-1/2 -translate-y-1/2 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            "w-full h-[48px] rounded-[14px] bg-white text-[15px] text-[#0D1B3E] outline-none transition-all duration-200 placeholder:text-gray-400",
            icon ? "pl-18 pr-4" : "px-4",
            error ? "ring-2 ring-red-500" : "focus:ring-2 focus:ring-white/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-400 px-1">{error}</span>}
    </div>
  );
}
