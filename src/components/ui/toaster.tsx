"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 sm:max-w-[380px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border bg-background p-4 shadow-lg animate-in slide-in-from-bottom-4 fade-in-0",
            toast.variant === "destructive" &&
              "border-destructive/50 text-destructive"
          )}
        >
          <div className="flex-1 space-y-1">
            {toast.title && (
              <p className="text-sm font-semibold">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
