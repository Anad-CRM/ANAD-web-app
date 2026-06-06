import * as React from "react"

export const DropdownMenu = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuTrigger = ({ children, asChild }: any) => <div className="dropdown-trigger">{children}</div>;
export const DropdownMenuContent = ({ children, align }: any) => <div className="dropdown-content absolute bg-white shadow rounded p-2 z-50">{children}</div>;
export const DropdownMenuItem = ({ children, onClick, className }: any) => <div className={`cursor-pointer p-2 hover:bg-gray-100 ${className || ''}`} onClick={onClick}>{children}</div>;
export const DropdownMenuSeparator = () => <hr className="my-1" />;
