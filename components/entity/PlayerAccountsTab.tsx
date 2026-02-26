"use client";

import { useEffect, useState } from "react";
import * as playerPaymentMethodsService from "@/services/playerPaymentMethodsService";
import { safeParsePaymentDetails } from "@/lib/safeJson";

interface PlayerAccountsTabProps {
  entityId: string;
}

export function PlayerAccountsTab({ entityId }: PlayerAccountsTabProps) {
  const [rows, setRows] = useState<playerPaymentMethodsService.PlayerPaymentMethodRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    playerPaymentMethodsService
      .fetchPlayerPaymentMethodsByEntity(entityId)
      .then((data) => {
        if (!active) return;
        setRows(data);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [entityId]);

  if (loading) {
    return <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-10 text-center text-sm text-gray-400">Loading...</div>;
  }
  if (error) {
    return <div className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-4 text-sm text-red-300">{error}</div>;
  }
  if (rows.length === 0) {
    return <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-10 text-center text-sm text-gray-400">No accounts found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-slate-800/50">
      <table className="min-w-full divide-y divide-gray-700 text-left text-sm">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-300">Player</th>
            <th className="px-4 py-3 font-medium text-gray-300">Method</th>
            <th className="px-4 py-3 font-medium text-gray-300">Details</th>
            <th className="px-4 py-3 font-medium text-gray-300">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-slate-800/30">
          {rows.map((r) => {
            const details = safeParsePaymentDetails(r.details);
            return (
              <tr key={r.id} className="hover:bg-slate-700/40">
                <td className="px-4 py-3 text-gray-100">{r.player?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-200">{r.method_name}</td>
                <td className="px-4 py-3">
                  <pre className="max-h-24 overflow-auto rounded border border-gray-700 bg-slate-900 p-2 text-xs text-gray-300">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

