"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToast, type ToastVariant } from "@/store/toast";
import { cn } from "@/lib/format";

const icons: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styles: Record<ToastVariant, string> = {
  success: "text-emerald-600 bg-emerald-50",
  error: "text-rose-600 bg-rose-50",
  info: "text-brand-600 bg-brand-50",
};

export function Toaster() {
  const toasts = useToast((state) => state.toasts);
  const dismiss = useToast((state) => state.dismiss);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[130] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5 sm:bottom-6 sm:right-6"
    >
      {toasts.map((item) => {
        const Icon = icons[item.variant];
        return (
          <div
            key={item.id}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(28,23,12,0.35)] animate-toast-in"
          >
            <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", styles[item.variant])}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-950">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                  {item.description}
                </p>
              )}
              {item.action && (
                <Link
                  href={item.action.href}
                  onClick={() => dismiss(item.id)}
                  className="mt-2 inline-flex text-xs font-bold text-brand-700 hover:text-brand-800"
                >
                  {item.action.label} →
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Fechar notificação"
              className="grid size-6 shrink-0 place-items-center rounded-md text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
