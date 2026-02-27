"use client";

import React from "react";

function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200 " + className
      }
      aria-hidden="true"
    />
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

