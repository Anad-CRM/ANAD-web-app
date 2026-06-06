import * as React from "react"

export const Popover = ({ children }: any) => <div>{children}</div>;
export const PopoverTrigger = ({ children, asChild }: any) => <div className="popover-trigger">{children}</div>;
export const PopoverContent = ({ children, align, sideOffset, className }: any) => <div className={`popover-content absolute bg-white shadow rounded p-2 z-50 ${className || ''}`}>{children}</div>;
