"use client";

import * as React from "react";
import { useState, createContext, useContext, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface PopoverContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = createContext<PopoverContextProps | null>(null);

export const Popover = ({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (nextOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(nextOpen);
    } else {
      setUncontrolledOpen(nextOpen);
    }
  };

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
  }, [isControlled, onOpenChange]);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger = ({
  children,
  asChild,
  className,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const context = useContext(PopoverContext);
  if (!context) return null;
  const { open, setOpen } = context;

  return (
    <div
      className={cn("popover-trigger cursor-pointer select-none", className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </div>
  );
};

export const PopoverContent = ({
  children,
  align = "center",
  sideOffset = 4,
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}) => {
  const context = useContext(PopoverContext);
  if (!context) return null;
  const { open } = context;

  if (!open) return null;

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      className={cn(
        "popover-content absolute bg-slate-800 border border-slate-700 shadow-md rounded-md p-2 z-50",
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};
