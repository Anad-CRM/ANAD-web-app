"use client";

import * as React from "react";
import { useState, createContext, useContext, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

const DropdownMenuContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({
  children,
  className,
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}) => {
  const context = useContext(DropdownMenuContext);
  if (!context) return null;
  const { open, setOpen } = context;

  return (
    <div
      className={cn("dropdown-trigger cursor-pointer select-none", className)}
      onClick={() => setOpen(!open)}
    >
      {children}
    </div>
  );
};

export const DropdownMenuContent = ({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}) => {
  const context = useContext(DropdownMenuContext);
  if (!context) return null;
  const { open } = context;

  if (!open) return null;

  const alignClasses = {
    start: "left-0 origin-top-left",
    center: "left-1/2 -translate-x-1/2 origin-top",
    end: "right-0 origin-top-right",
  };

  return (
    <div
      className={cn(
        "dropdown-content absolute mt-1 w-48 rounded-md border border-slate-700 bg-slate-800 shadow-lg p-1 z-50",
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const context = useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (onClick) onClick();
    if (context) {
      context.setOpen(false);
    }
  };

  return (
    <div
      className={cn(
        "cursor-pointer p-2 rounded-sm text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator = () => (
  <hr className="my-1 border-slate-700" />
);
