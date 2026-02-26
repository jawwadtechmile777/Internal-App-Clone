"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as entityService from "@/services/entityService";
import * as rechargeService from "@/services/rechargeService";

export interface RechargeFormState {
  playerQuery: string;
  selectedPlayer: entityService.PlayerOption | null;
  playerSuggestions: entityService.PlayerOption[];
  playerSearching: boolean;
  playerSearchError: string | null;

  gameId: string;
  games: entityService.PlayerGameOption[];
  gamesLoading: boolean;
  gamesError: string | null;

  paymentMethodId: string;
  paymentMethods: entityService.PlayerPaymentMethodOption[];
  paymentMethodsLoading: boolean;
  paymentMethodsError: string | null;

  amount: string;
  bonusPercentage: string;
  bonusAmount: string;
  remarks: string;

  finalAmountPreview: number;
  submitting: boolean;
  submitError: string | null;
  fieldErrors: Partial<Record<"player" | "game" | "paymentMethod" | "amount", string>>;
}

export function useRechargeForm(params: {
  entityId: string;
  requestedByUserId: string;
  onSuccess: () => void;
}) {
  const { entityId, requestedByUserId, onSuccess } = params;

  const [playerQuery, setPlayerQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<entityService.PlayerOption | null>(null);
  const [playerSuggestions, setPlayerSuggestions] = useState<entityService.PlayerOption[]>([]);
  const [playerSearching, setPlayerSearching] = useState(false);
  const [playerSearchError, setPlayerSearchError] = useState<string | null>(null);
  const playerSearchSeq = useRef(0);

  const [games, setGames] = useState<entityService.PlayerGameOption[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [gameId, setGameId] = useState("");

  const [paymentMethods, setPaymentMethods] = useState<entityService.PlayerPaymentMethodOption[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const [amount, setAmount] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const manualBonusRef = useRef(false);

  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RechargeFormState["fieldErrors"]>({});

  const amountNum = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);
  const bonusPctNum = useMemo(() => {
    const n = parseFloat(bonusPercentage);
    return Number.isFinite(n) ? n : 0;
  }, [bonusPercentage]);
  const bonusAmtNum = useMemo(() => {
    const n = parseFloat(bonusAmount);
    return Number.isFinite(n) ? n : 0;
  }, [bonusAmount]);

  const finalAmountPreview = useMemo(() => {
    const a = Math.max(0, amountNum);
    const b = Math.max(0, bonusAmtNum);
    return a + b;
  }, [amountNum, bonusAmtNum]);

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
      const timeoutMs = 8000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Search timed out. Please try again.")), timeoutMs);
      });

      try {
        const results = await Promise.race([
          entityService.searchPlayersByEntity({ entityId, query: q, limit: 10 }),
          timeoutPromise,
        ]);
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

    // Reset dependent fields
    setGames([]);
    setGameId("");
    setPaymentMethods([]);
    setPaymentMethodId("");

    setGamesLoading(true);
    setGamesError(null);
    setPaymentMethodsLoading(true);
    setPaymentMethodsError(null);

    try {
      const [g, pm] = await Promise.all([
        entityService.fetchGamesByPlayer(p.id),
        entityService.fetchPaymentMethodsByPlayer(p.id),
      ]);
      setGames(g);
      setPaymentMethods(pm);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setGamesError(msg);
      setPaymentMethodsError(msg);
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

  // Bonus auto-calc when amount or bonusPercentage changes (unless manual override)
  useEffect(() => {
    if (manualBonusRef.current) return;
    const a = Math.max(0, amountNum);
    const pct = Math.max(0, bonusPctNum);
    if (!a || !pct) {
      setBonusAmount("");
      return;
    }
    const calc = (a * pct) / 100;
    setBonusAmount(calc.toFixed(2));
  }, [amountNum, bonusPctNum]);

  const setBonusAmountManual = useCallback((val: string) => {
    manualBonusRef.current = true;
    setBonusAmount(val);
    const a = Math.max(0, amountNum);
    const b = Math.max(0, parseFloat(val || "0") || 0);
    if (a > 0) {
      const pct = (b / a) * 100;
      setBonusPercentage(pct ? pct.toFixed(2) : "");
    }
  }, [amountNum]);

  const setBonusPercentageWithAuto = useCallback((val: string) => {
    manualBonusRef.current = false;
    setBonusPercentage(val);
  }, []);

  const validate = useCallback(() => {
    const errs: RechargeFormState["fieldErrors"] = {};
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
      // Security: verify player belongs to entity
      const playerEntityId = await entityService.fetchPlayerEntityId(selectedPlayer.id);
      if (!playerEntityId || playerEntityId !== entityId) {
        throw new Error("Selected player does not belong to this entity.");
      }

      const amt = Math.max(0, parseFloat(amount) || 0);
      const pct = Math.max(0, parseFloat(bonusPercentage) || 0);
      const bAmt = Math.max(0, parseFloat(bonusAmount) || 0);

      await rechargeService.createRechargeRequest({
        entity_id: entityId,
        player_id: selectedPlayer.id,
        game_id: gameId,
        payment_method_id: paymentMethodId,
        amount: amt,
        bonus_percentage: pct,
        bonus_amount: bAmt,
        remarks: remarks.trim() || null,
        requested_by: requestedByUserId,
      });

      onSuccess();
      return true;
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [validate, selectedPlayer, entityId, amount, bonusPercentage, bonusAmount, remarks, requestedByUserId, gameId, paymentMethodId, onSuccess]);

  const state: RechargeFormState = {
    playerQuery,
    selectedPlayer,
    playerSuggestions,
    playerSearching,
    playerSearchError,
    gameId,
    games,
    gamesLoading,
    gamesError,
    paymentMethodId,
    paymentMethods,
    paymentMethodsLoading,
    paymentMethodsError,
    amount,
    bonusPercentage,
    bonusAmount,
    remarks,
    finalAmountPreview,
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
      setBonusPercentage: setBonusPercentageWithAuto,
      setBonusAmount: setBonusAmountManual,
      setRemarks,
      submit,
      reset: () => {
        setPlayerQuery("");
        setSelectedPlayer(null);
        setPlayerSuggestions([]);
        setPlayerSearching(false);
        setPlayerSearchError(null);
        setGames([]);
        setGamesLoading(false);
        setGamesError(null);
        setGameId("");
        setPaymentMethods([]);
        setPaymentMethodsLoading(false);
        setPaymentMethodsError(null);
        setPaymentMethodId("");
        setAmount("");
        setBonusPercentage("");
        setBonusAmount("");
        manualBonusRef.current = false;
        setRemarks("");
        setSubmitError(null);
        setFieldErrors({});
      },
    },
  };
}

