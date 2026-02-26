"use client";

import { useToast } from "@/hooks/useToast";

function variantClasses(variant: "success" | "error" | "info") {
  if (variant === "success") return "border-emerald-800 bg-emerald-900/30 text-emerald-100";
  if (variant === "error") return "border-red-800 bg-red-900/30 text-red-100";
  return "border-gray-700 bg-slate-900 text-gray-100";
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl border p-3 shadow-xl backdrop-blur ${variantClasses(t.variant)}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{t.title}</div>
              {t.description && (
                <div className="mt-1 text-sm text-gray-200/80">{t.description}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="rounded p-1 text-gray-300 hover:bg-white/10"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

