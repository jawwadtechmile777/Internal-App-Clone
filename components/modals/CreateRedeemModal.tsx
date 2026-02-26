"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import * as entityService from "@/services/entityService";
import * as redeemService from "@/services/redeemService";

interface CreateRedeemModalProps {
  open: boolean;
  onClose: () => void;
  createdByUserId: string;
  entityId: string;
  onCreated: () => void;
}

export function CreateRedeemModal({
  open,
  onClose,
  createdByUserId,
  entityId,
  onCreated,
}: CreateRedeemModalProps) {
  const [players, setPlayers] = useState<entityService.PlayerOption[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [flowType, setFlowType] = useState<"CT" | "PT">("PT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    entityService.fetchPlayersByEntity(entityId).then(setPlayers).catch(() => setPlayers([]));
  }, [open, entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(totalAmount);
    if (!playerId || Number.isNaN(amt) || amt <= 0) {
      setError("Player and a positive amount are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await redeemService.createRedeemRequest({
        entity_id: entityId,
        player_id: playerId,
        total_amount: amt,
        flow_type: flowType,
        created_by: createdByUserId,
      });
      onCreated();
      onClose();
      setPlayerId("");
      setTotalAmount("");
      setFlowType("PT");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create redeem request">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300">Flow type</label>
          <select
            value={flowType}
            onChange={(e) => setFlowType(e.target.value as "CT" | "PT")}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="PT">PT</option>
            <option value="CT">CT</option>
          </select>
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-300">Total amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
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

