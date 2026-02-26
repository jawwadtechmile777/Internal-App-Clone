"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import * as entityService from "@/services/entityService";
import * as requestsService from "@/services/requestsService";

export type GenericRequestKey =
  | "transfer"
  | "reset_password"
  | "new_account_creation"
  | "referral"
  | "free_play";

export const GENERIC_REQUEST_TYPE_BY_KEY: Record<GenericRequestKey, string> = {
  transfer: "transfer",
  reset_password: "reset_password",
  new_account_creation: "new_account_creation",
  referral: "referral",
  free_play: "free_play",
};

export const GENERIC_REQUEST_LABEL_BY_KEY: Record<GenericRequestKey, string> = {
  transfer: "Transfer",
  reset_password: "Reset Password",
  new_account_creation: "New Account Creation",
  referral: "Referral",
  free_play: "Free play",
};

interface CreateRequestModalProps {
  open: boolean;
  onClose: () => void;
  createdByUserId: string;
  entityId: string;
  requestKey: GenericRequestKey;
  onCreated: () => void;
}

export function CreateRequestModal({
  open,
  onClose,
  createdByUserId,
  entityId,
  requestKey,
  onCreated,
}: CreateRequestModalProps) {
  const [players, setPlayers] = useState<entityService.PlayerOption[]>([]);
  const [games, setGames] = useState<entityService.GameOption[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [amount, setAmount] = useState("");
  const [sourceGameId, setSourceGameId] = useState("");
  const [targetGameId, setTargetGameId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestType = GENERIC_REQUEST_TYPE_BY_KEY[requestKey];
  const label = GENERIC_REQUEST_LABEL_BY_KEY[requestKey];

  const needsAmount = requestKey === "transfer";
  const needsGames = requestKey === "transfer";

  useEffect(() => {
    if (!open) return;
    entityService.fetchPlayersByEntity(entityId).then(setPlayers).catch(() => setPlayers([]));
    if (needsGames) {
      entityService.fetchGames().then(setGames).catch(() => setGames([]));
    } else {
      setGames([]);
    }
  }, [open, entityId, needsGames]);

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open, requestKey]);

  const canSubmit = useMemo(() => {
    if (!playerId) return false;
    if (needsAmount) {
      const n = parseFloat(amount);
      if (!Number.isFinite(n) || n <= 0) return false;
    }
    if (needsGames) {
      if (!sourceGameId || !targetGameId) return false;
      if (sourceGameId === targetGameId) return false;
    }
    return true;
  }, [playerId, needsAmount, amount, needsGames, sourceGameId, targetGameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    try {
      const amt = amount ? parseFloat(amount) : null;
      await requestsService.createRequest({
        entity_id: entityId,
        player_id: playerId,
        type: requestType,
        amount: needsAmount ? amt : (amt ?? null),
        source_game_id: needsGames ? (sourceGameId || null) : null,
        target_game_id: needsGames ? (targetGameId || null) : null,
        created_by: createdByUserId,
        remarks: remarks.trim() || null,
      });
      onCreated();
      onClose();
      setPlayerId("");
      setAmount("");
      setSourceGameId("");
      setTargetGameId("");
      setRemarks("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Create ${label} request`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300">Player</label>
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            required
          >
            <option value="">Select player</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {needsGames && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300">Source game</label>
              <select
                value={sourceGameId}
                onChange={(e) => setSourceGameId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                required
              >
                <option value="">Select source</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Target game</label>
              <select
                value={targetGameId}
                onChange={(e) => setTargetGameId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                required
              >
                <option value="">Select target</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {(needsAmount || requestKey === "referral" || requestKey === "free_play") && (
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Amount {needsAmount ? "" : "(optional)"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              required={needsAmount}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300">Remarks (optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" loading={loading} disabled={!canSubmit || loading}>
            Create
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

