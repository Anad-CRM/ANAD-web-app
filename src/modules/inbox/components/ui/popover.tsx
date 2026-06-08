import * as React from "react"

export const Popover = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const PopoverTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => <div className="popover-trigger">{children}</div>;
export const PopoverContent = ({ children, align, sideOffset, className }: { children: React.ReactNode; align?: "start" | "center" | "end"; sideOffset?: number; className?: string }) => <div className={`popover-content absolute bg-white shadow rounded p-2 z-50 ${className || ''}`}>{children}</div>;
