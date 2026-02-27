"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useRedeemForm, formatPaymentMethodLabel } from "@/hooks/useRedeemForm";
import { useToast } from "@/hooks/useToast";

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
  const { showToast } = useToast();
  const { state, actions } = useRedeemForm({
    entityId,
    createdByUserId,
    onSuccess: () => {
      onCreated();
    },
  });

  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    actions.reset();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    if (!state.selectedPlayer && state.playerQuery.trim()) setSuggestionsOpen(true);
  }, [open, state.selectedPlayer, state.playerQuery]);

  const canShowSuggestions = useMemo(() => {
    const hasContent =
      state.playerSearching ||
      !!state.playerSearchError ||
      state.playerSuggestions.length > 0;
    return (
      open &&
      !state.selectedPlayer &&
      state.playerQuery.trim().length > 0 &&
      (suggestionsOpen || hasContent)
    );
  }, [open, suggestionsOpen, state.selectedPlayer, state.playerQuery, state.playerSearching, state.playerSearchError, state.playerSuggestions.length]);

  const handleSubmit = async () => {
    const ok = await actions.submit();
    if (ok) {
      showToast({ variant: "success", title: "Redeem request created" });
      onClose();
    } else if (state.submitError) {
      showToast({ variant: "error", title: "Failed to create redeem", description: state.submitError });
    }
  };

  const inputCls = (hasError: boolean) =>
    `mt-1 w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 ${
      hasError ? "border-red-700" : "border-gray-600 focus:border-slate-500"
    }`;

  const selectCls = (hasError: boolean) =>
    `mt-1 w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed ${
      hasError ? "border-red-700" : "border-gray-600 focus:border-slate-500"
    }`;

  return (
    <Modal open={open} onClose={onClose} title="Create Redeem Request">
      <div className="space-y-4">
        {state.submitError && (
          <div className="rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-sm text-red-200">
            {state.submitError}
          </div>
        )}

        {/* Player Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Player</label>
          <div className="relative mt-1">
            <input
              value={state.playerQuery}
              onChange={(e) => {
                if (state.selectedPlayer) actions.clearSelectedPlayer();
                actions.setPlayerQuery(e.target.value);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
              placeholder="Search player name…"
              className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                state.fieldErrors.player ? "border-red-700" : "border-gray-600 focus:border-slate-500"
              }`}
            />
            {state.selectedPlayer && (
              <button
                type="button"
                onClick={() => actions.clearSelectedPlayer()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
              >
                Clear
              </button>
            )}
            {canShowSuggestions && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-700 bg-slate-800 shadow-xl">
                {state.playerSearching ? (
                  <div className="px-3 py-2 text-sm text-gray-400">Searching…</div>
                ) : state.playerSearchError ? (
                  <div className="px-3 py-2 text-sm text-red-300">{state.playerSearchError}</div>
                ) : state.playerSuggestions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">No player available with this name</div>
                ) : (
                  <ul className="max-h-56 overflow-auto">
                    {state.playerSuggestions.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-200 hover:bg-slate-700/50"
                          onClick={() => {
                            actions.selectPlayer(p);
                            setSuggestionsOpen(false);
                          }}
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="ml-3 shrink-0 font-mono text-xs text-gray-500">{p.id.slice(0, 8)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          {state.fieldErrors.player && <p className="mt-1 text-xs text-red-300">{state.fieldErrors.player}</p>}
        </div>

        {/* Game + Payment Method row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Game</label>
            <select
              value={state.gameId}
              onChange={(e) => actions.setGameId(e.target.value)}
              disabled={!state.selectedPlayer || state.gamesLoading}
              className={selectCls(!!state.fieldErrors.game)}
            >
              <option value="">{state.selectedPlayer ? (state.gamesLoading ? "Loading…" : "Select game") : "Select player first"}</option>
              {state.games.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {state.selectedPlayer && !state.gamesLoading && state.games.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">No games available for this player</p>
            )}
            {state.fieldErrors.game && <p className="mt-1 text-xs text-red-300">{state.fieldErrors.game}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Payment Method</label>
            <select
              value={state.paymentMethodId}
              onChange={(e) => actions.setPaymentMethodId(e.target.value)}
              disabled={!state.selectedPlayer || state.paymentMethodsLoading}
              className={selectCls(!!state.fieldErrors.paymentMethod)}
            >
              <option value="">{state.selectedPlayer ? (state.paymentMethodsLoading ? "Loading…" : "Select payment method") : "Select player first"}</option>
              {state.paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>{formatPaymentMethodLabel(pm)}</option>
              ))}
            </select>
            {state.selectedPlayer && !state.paymentMethodsLoading && state.paymentMethods.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">No payment methods available for this player</p>
            )}
            {state.fieldErrors.paymentMethod && (
              <p className="mt-1 text-xs text-red-300">{state.fieldErrors.paymentMethod}</p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Total Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.amount}
            onChange={(e) => actions.setAmount(e.target.value)}
            placeholder="Enter amount"
            className={inputCls(!!state.fieldErrors.amount)}
          />
          {state.fieldErrors.amount && <p className="mt-1 text-xs text-red-300">{state.fieldErrors.amount}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button type="button" onClick={handleSubmit} loading={state.submitting} disabled={state.submitting}>
            Create
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={state.submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
