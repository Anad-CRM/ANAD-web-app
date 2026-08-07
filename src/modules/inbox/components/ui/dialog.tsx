import * as React from "react"
import { cn } from "../../lib/utils"

export const Dialog = ({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) =>
  open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onOpenChange?.(false); }}
    >
      {children}
    </div>
  ) : null;

export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) =>
  <div className={cn("relative w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl", className)}>{children}</div>;

export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) =>
  <div className={cn("mb-4 space-y-1", className)}>{children}</div>;

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) =>
  <h2 className={cn("text-lg font-semibold text-white", className)}>{children}</h2>;

export const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) =>
  <p className={cn("text-sm text-slate-400", className)}>{children}</p>;

export const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) =>
  <div className={cn("mt-4 flex items-center justify-end gap-2", className)}>{children}</div>;

export const DialogTrigger = ({ children, asChild }: { children: React.ReactNode | ((props: any) => React.ReactNode); asChild?: boolean }) => {
  const content = typeof children === "function" ? (children as any)({}) : children;
  if (typeof content === "function") {
    const Component = content as any;
    return <div><Component /></div>;
  }
  return <div>{content}</div>;
};
