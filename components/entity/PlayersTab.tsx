"use client";

import { useEffect, useState } from "react";
import * as entityService from "@/services/entityService";

interface PlayersTabProps {
  entityId: string;
}

export function PlayersTab({ entityId }: PlayersTabProps) {
  const [rows, setRows] = useState<entityService.PlayerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    entityService
      .fetchPlayersByEntity(entityId)
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
    return <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-10 text-center text-sm text-gray-400">No players found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-slate-800/50">
      <table className="min-w-full divide-y divide-gray-700 text-left text-sm">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-300">Player</th>
            <th className="px-4 py-3 font-medium text-gray-300">Status</th>
            <th className="px-4 py-3 font-medium text-gray-300">ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-slate-800/30">
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-slate-700/40">
              <td className="px-4 py-3 text-gray-100">{p.name}</td>
              <td className="px-4 py-3 text-gray-400">{p.status}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

