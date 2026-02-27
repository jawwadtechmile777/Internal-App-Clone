"use client";

import React from "react";

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={"h-3 w-full animate-pulse rounded bg-slate-700/60 " + className} />;
}

export function TableSkeleton({
  columns = 6,
  rows = 8,
  showHeader = true,
}: {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}) {
  const colArr = Array.from({ length: Math.max(1, columns) });
  const rowArr = Array.from({ length: Math.max(1, rows) });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-slate-800/50">
      <table className="min-w-full divide-y divide-gray-700 text-left text-sm">
        {showHeader ? (
          <thead className="bg-slate-800">
            <tr>
              {colArr.map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <SkeletonLine className="max-w-[140px]" />
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody className="divide-y divide-gray-700 bg-slate-800/30">
          {rowArr.map((_, r) => (
            <tr key={r}>
              {colArr.map((__, c) => (
                <td key={c} className="px-4 py-3">
                  <SkeletonLine className={c === 0 ? "max-w-[90px]" : "max-w-[220px]"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

