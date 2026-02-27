"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { getDefaultDashboardHref } from "@/lib/roleGuard";
import type { AuthUserProfile } from "@/types/user";
import type { Department } from "@/types/department";

interface AuthState {
  user: AuthUserProfile | null;
  loading: boolean;
  error: Error | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();
  const supabase = createClient();

  const fetchUserProfile = useCallback(async (userId: string): Promise<AuthUserProfile | null> => {
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id, entity_id, department_id, role, status, created_at")
      .eq("id", userId)
      .single();

    if (userError || !userRow) return null;

    const { data: deptRow } = await supabase
      .from("departments")
      .select("id, name")
      .eq("id", (userRow as { department_id: string }).department_id)
      .single();

    const department: Department | null = deptRow
      ? { id: (deptRow as { id: string }).id, name: (deptRow as { name: string }).name }
      : null;

    const profile: AuthUserProfile = {
      id: (userRow as { id: string }).id,
      entity_id: (userRow as { entity_id: string | null }).entity_id,
      department_id: (userRow as { department_id: string }).department_id,
      role: (userRow as { role: string }).role as AuthUserProfile["role"],
      status: (userRow as { status: string }).status,
      created_at: (userRow as { created_at: string }).created_at,
      department,
    };
    return profile;
  }, [supabase]);

  const refetchUser = useCallback(async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser?.id) {
      setState((s) => ({ ...s, user: null, loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const profile = await fetchUserProfile(authUser.id);
      setState((s) => ({ ...s, user: profile, loading: false }));
    } catch (e) {
      setState((s) => ({
        ...s,
        user: null,
        loading: false,
        error: e instanceof Error ? e : new Error(String(e)),
      }));
    }
  }, [supabase, fetchUserProfile]);

  useEffect(() => {
    let mounted = true;
    let signOutTimer: ReturnType<typeof setTimeout> | null = null;

    const init = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (!mounted) return;
        if (authError || !authUser?.id) {
          setState({ user: null, loading: false, error: null });
          return;
        }
        const profile = await fetchUserProfile(authUser.id);
        if (mounted) setState({ user: profile, loading: false, error: null });
      } catch (e) {
        if (mounted) {
          setState({
            user: null,
            loading: false,
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
      } finally {
        if (mounted) setState((s) => ({ ...s, loading: false }));
      }
    };

    init();

    const timeoutId = window.setTimeout(() => {
      setState((s) => (s.loading ? { ...s, loading: false } : s));
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session?.user?.id) {
        if (signOutTimer) clearTimeout(signOutTimer);
        signOutTimer = setTimeout(() => {
          if (!mounted) return;
          setState((prev) => {
            if (!prev.user) return prev;
            return { user: null, loading: false, error: null };
          });
        }, 2000);
        return;
      }

      if (signOutTimer) {
        clearTimeout(signOutTimer);
        signOutTimer = null;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setState((prev) => ({ ...prev, user: profile, loading: false, error: null }));
          }
        } catch {
          // Token refresh succeeded but profile fetch failed — keep previous user to avoid flicker
        }
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" || !mounted) return;
      supabase.auth.getUser().then(({ data: { user: authUser }, error: authError }) => {
        if (!mounted) return;
        if (authError || !authUser?.id) return;
        setState((prev) => {
          if (prev.user && !prev.loading) return prev;
          return { ...prev, loading: false };
        });
      });
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      if (signOutTimer) clearTimeout(signOutTimer);
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [supabase, fetchUserProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setState((s) => ({ ...s, loading: false, error: error }));
        throw error;
      }
      if (data.session?.user?.id) {
        const profile = await fetchUserProfile(data.session.user.id);
        setState((s) => ({ ...s, user: profile, loading: false }));
        const href = getDefaultDashboardHref(profile ?? null);
        router.replace(href);
      }
    },
    [supabase, fetchUserProfile, router]
  );

  const signOut = useCallback(async () => {
    try {
      // Clear cookie-based session so middleware no longer treats user as authenticated.
      await fetch("/auth/signout", { method: "POST", credentials: "include" });
    } finally {
      // Best-effort local cleanup (covers any in-memory/local storage state).
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      setState({ user: null, loading: false, error: null });
      router.replace("/login");
      router.refresh();
    }
  }, [supabase, router]);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
