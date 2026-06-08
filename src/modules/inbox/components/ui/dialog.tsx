import * as React from "react"

export const Dialog = ({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) => open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">{children}</div> : null;
export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`bg-white p-6 rounded-lg shadow-lg ${className || ''}`}>{children}</div>;
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-4">{children}</div>;
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h2 className="text-lg font-bold">{children}</h2>;
export const DialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-gray-500">{children}</p>;
export const DialogFooter = ({ children }: { children: React.ReactNode }) => <div className="mt-4 flex justify-end gap-2">{children}</div>;
export const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => <div>{children}</div>;
