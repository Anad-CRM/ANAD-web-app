"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export default function Button({
  children,
  disabled,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        "w-full py-3 rounded-3xl font-medium transition",
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blueShade text-white hover:bg-blueLight cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
}
