"use client";

interface StatusBadgeProps {
  status: string | null | undefined;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const value = status ?? "—";
  const key = typeof status === "string" ? normalize(status) : "";

  let cls = "bg-slate-700 text-gray-200 border border-gray-600";
  if (key.includes("complete")) cls = "bg-emerald-900/40 text-emerald-200 border border-emerald-800";
  else if (key.includes("payment submitted") || key.includes("submitted")) cls = "bg-emerald-900/40 text-emerald-200 border border-emerald-800";
  else if (key.includes("reject")) cls = "bg-red-900/40 text-red-200 border border-red-800";
  else if (key.includes("cancel")) cls = "bg-red-900/30 text-red-200 border border-red-800";
  else if (key.includes("approve")) cls = "bg-sky-900/40 text-sky-200 border border-sky-800";
  else if (key.includes("pending") || key.includes("waiting")) cls = "bg-amber-900/30 text-amber-200 border border-amber-800";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}

