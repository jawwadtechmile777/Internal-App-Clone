"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as entityService from "@/services/entityService";
import * as redeemService from "@/services/redeemService";
import { safeParsePaymentDetails } from "@/lib/safeJson";

export interface RedeemFormState {
  playerQuery: string;
  selectedPlayer: entityService.PlayerOption | null;
  playerSuggestions: entityService.PlayerOption[];
  playerSearching: boolean;
  playerSearchError: string | null;

  gameId: string;
  games: entityService.PlayerGameOption[];
  gamesLoading: boolean;

  paymentMethodId: string;
  paymentMethods: entityService.PlayerPaymentMethodOption[];
  paymentMethodsLoading: boolean;

  amount: string;

  submitting: boolean;
  submitError: string | null;
  fieldErrors: Partial<Record<"player" | "game" | "paymentMethod" | "amount", string>>;
}

export function formatPaymentMethodLabel(pm: entityService.PlayerPaymentMethodOption): string {
  const d = safeParsePaymentDetails(pm.details);
  const acctNum =
    (d["account_number"] as string | undefined) ??
    (d["mobile_number"] as string | undefined) ??
    (d["mobile"] as string | undefined) ??
    (d["phone_number"] as string | undefined) ??
    (d["iban"] as string | undefined) ??
    (d["username"] as string | undefined) ??
    undefined;
  return acctNum ? `${pm.method_name} - ${acctNum}` : pm.method_name;
}

export function useRedeemForm(params: {
  entityId: string;
  createdByUserId: string;
  onSuccess: () => void;
}) {
  const { entityId, createdByUserId, onSuccess } = params;

  const [playerQuery, setPlayerQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<entityService.PlayerOption | null>(null);
  const [playerSuggestions, setPlayerSuggestions] = useState<entityService.PlayerOption[]>([]);
  const [playerSearching, setPlayerSearching] = useState(false);
  const [playerSearchError, setPlayerSearchError] = useState<string | null>(null);
  const playerSearchSeq = useRef(0);

  const [games, setGames] = useState<entityService.PlayerGameOption[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gameId, setGameId] = useState("");

  const [paymentMethods, setPaymentMethods] = useState<entityService.PlayerPaymentMethodOption[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RedeemFormState["fieldErrors"]>({});

  // Debounced player search (300ms)
  useEffect(() => {
    const q = playerQuery.trim();
    if (!q || selectedPlayer) {
      setPlayerSuggestions([]);
      setPlayerSearching(false);
      setPlayerSearchError(null);
      return;
    }
    playerSearchSeq.current += 1;
    const seq = playerSearchSeq.current;
    setPlayerSearching(true);
    setPlayerSearchError(null);

    const handle = window.setTimeout(async () => {
      try {
        const results = await entityService.searchPlayersByEntity({
          entityId,
          query: q,
          limit: 10,
        });
        if (playerSearchSeq.current !== seq) return;
        setPlayerSuggestions(results);
      } catch (e) {
        if (playerSearchSeq.current !== seq) return;
        setPlayerSearchError(e instanceof Error ? e.message : String(e));
        setPlayerSuggestions([]);
      } finally {
        if (playerSearchSeq.current !== seq) return;
        setPlayerSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [playerQuery, entityId, selectedPlayer]);

  const selectPlayer = useCallback(async (p: entityService.PlayerOption) => {
    setSelectedPlayer(p);
    setPlayerQuery(p.name);
    setPlayerSuggestions([]);
    setFieldErrors((prev) => ({ ...prev, player: undefined }));

    setGames([]);
    setGameId("");
    setPaymentMethods([]);
    setPaymentMethodId("");

    setGamesLoading(true);
    setPaymentMethodsLoading(true);

    try {
      const [g, pm] = await Promise.all([
        entityService.fetchGamesByPlayer(p.id),
        entityService.fetchPaymentMethodsByPlayer(p.id),
      ]);
      setGames(g);
      setPaymentMethods(pm);
    } catch {
      setGames([]);
      setPaymentMethods([]);
    } finally {
      setGamesLoading(false);
      setPaymentMethodsLoading(false);
    }
  }, []);

  const clearSelectedPlayer = useCallback(() => {
    setSelectedPlayer(null);
    setPlayerQuery("");
    setPlayerSuggestions([]);
    setGames([]);
    setGameId("");
    setPaymentMethods([]);
    setPaymentMethodId("");
  }, []);

  const validate = useCallback(() => {
    const errs: RedeemFormState["fieldErrors"] = {};
    if (!selectedPlayer?.id) errs.player = "Player is required.";
    if (!gameId) errs.game = "Game is required.";
    if (!paymentMethodId) errs.paymentMethod = "Payment method is required.";
    const a = parseFloat(amount);
    if (!Number.isFinite(a) || a <= 0) errs.amount = "Amount must be greater than 0.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [selectedPlayer, gameId, paymentMethodId, amount]);

  const submit = useCallback(async () => {
    setSubmitError(null);
    if (!validate()) return false;
    if (!selectedPlayer) return false;

    setSubmitting(true);
    try {
      const playerEntityId = await entityService.fetchPlayerEntityId(selectedPlayer.id);
      if (!playerEntityId || playerEntityId !== entityId) {
        throw new Error("Selected player does not belong to this entity.");
      }

      const totalAmount = Math.max(0, parseFloat(amount) || 0);

      await redeemService.createRedeemRequest({
        entity_id: entityId,
        player_id: selectedPlayer.id,
        game_id: gameId || null,
        payment_method_id: paymentMethodId || null,
        total_amount: totalAmount,
        created_by: createdByUserId,
      });

      onSuccess();
      return true;
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [validate, selectedPlayer, entityId, amount, gameId, paymentMethodId, createdByUserId, onSuccess]);

  const reset = useCallback(() => {
    setPlayerQuery("");
    setSelectedPlayer(null);
    setPlayerSuggestions([]);
    setPlayerSearching(false);
    setPlayerSearchError(null);
    setGames([]);
    setGamesLoading(false);
    setGameId("");
    setPaymentMethods([]);
    setPaymentMethodsLoading(false);
    setPaymentMethodId("");
    setAmount("");
    setSubmitError(null);
    setFieldErrors({});
  }, []);

  const state: RedeemFormState = {
    playerQuery,
    selectedPlayer,
    playerSuggestions,
    playerSearching,
    playerSearchError,
    gameId,
    games,
    gamesLoading,
    paymentMethodId,
    paymentMethods,
    paymentMethodsLoading,
    amount,
    submitting,
    submitError,
    fieldErrors,
  };

  return {
    state,
    actions: {
      setPlayerQuery,
      selectPlayer,
      clearSelectedPlayer,
      setGameId,
      setPaymentMethodId,
      setAmount,
      submit,
      reset,
    },
  };
}
