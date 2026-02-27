"use client";

import React from "react";

function Block({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-lg bg-slate-800/60 " + className} aria-hidden="true" />;
}

export function SectionSkeleton({
  blocks = 3,
  className = "",
}: {
  blocks?: number;
  className?: string;
}) {
  const arr = Array.from({ length: Math.max(1, blocks) });
  return (
    <div className={"space-y-3 " + className}>
      {arr.map((_, i) => (
        <Block key={i} className={i === 0 ? "h-10" : "h-24"} />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

