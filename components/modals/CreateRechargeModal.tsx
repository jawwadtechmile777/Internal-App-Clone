"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import * as entityService from "@/services/entityService";
import * as rechargeService from "@/services/rechargeService";
import type { RechargeRequestCreateInput } from "@/types/recharge";

interface CreateRechargeModalProps {
  open: boolean;
  onClose: () => void;
  requestedByUserId: string;
  onCreated: () => void;
}

export function CreateRechargeModal({
  open,
  onClose,
  requestedByUserId,
  onCreated,
}: CreateRechargeModalProps) {
  const [entities, setEntities] = useState<entityService.EntityOption[]>([]);
  const [players, setPlayers] = useState<entityService.PlayerOption[]>([]);
  const [entityId, setEntityId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [amount, setAmount] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState("0");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    entityService.fetchEntities().then(setEntities).catch(() => setEntities([]));
  }, [open]);

  useEffect(() => {
    if (!entityId) {
      setPlayers([]);
      setPlayerId("");
      return;
    }
    entityService.fetchPlayersByEntity(entityId).then(setPlayers).catch(() => setPlayers([]));
    setPlayerId("");
  }, [entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!entityId || !playerId || Number.isNaN(amt) || amt <= 0) {
      setError("Entity, player, and a positive amount are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const input: RechargeRequestCreateInput = {
        entity_id: entityId,
        player_id: playerId,
        amount: amt,
        bonus_percentage: parseFloat(bonusPercentage) || 0,
        remarks: remarks.trim() || null,
        requested_by: requestedByUserId,
      };
      await rechargeService.createRechargeRequest(input);
      onCreated();
      onClose();
      setEntityId("");
      setPlayerId("");
      setAmount("");
      setBonusPercentage("0");
      setRemarks("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create recharge request">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700">Entity</label>
          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select entity</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Player</label>
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            required
            disabled={!entityId}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Select player</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Bonus %</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={bonusPercentage}
            onChange={(e) => setBonusPercentage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            Create request
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
