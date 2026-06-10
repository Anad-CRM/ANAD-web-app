import * as React from "react"

import { cn } from "../../lib/utils"

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuTrigger = ({ children, className }: { children: React.ReactNode; asChild?: boolean; className?: string }) => <div className={cn("dropdown-trigger cursor-pointer", className)}>{children}</div>;
export const DropdownMenuContent = ({ children, className }: { children: React.ReactNode; align?: "start" | "center" | "end"; className?: string }) => <div className={cn("dropdown-content absolute bg-white shadow rounded p-2 z-50", className)}>{children}</div>;
export const DropdownMenuItem = ({ children, onClick, className, disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) => (
  <div 
    className={cn(
      "cursor-pointer p-2 hover:bg-gray-100", 
      disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
      className
    )} 
    onClick={disabled ? undefined : onClick}
  >
    {children}
  </div>
);
export const DropdownMenuSeparator = () => <hr className="my-1" />;
