"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { setDepartmentNameById } from "@/lib/roleGuard";
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

    if (department) {
      setDepartmentNameById((userRow as { department_id: string }).department_id, department.name);
    }

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setState((s) => ({ ...s, user: null, loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const profile = await fetchUserProfile(session.user.id);
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

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (!session?.user?.id) {
          setState({ user: null, loading: false, error: null });
          return;
        }
        const profile = await fetchUserProfile(session.user.id);
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
        setState({ user: null, loading: false, error: null });
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          const profile = await fetchUserProfile(session.user.id);
          setState({ user: profile, loading: false, error: null });
        } catch (e) {
          setState({
            user: null,
            loading: false,
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
      }
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
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
        const dept = profile?.department?.name ?? "";
        if (dept === "Executive") {
          router.replace("/dashboard/executive");
        } else if (dept === "Finance") {
          router.replace("/dashboard/finance");
        } else if (dept === "Verification") {
          router.replace("/dashboard/verification");
        } else if (dept === "Operations") {
          router.replace("/dashboard/operations");
        } else if (dept === "Support") {
          router.replace("/dashboard/support");
        } else {
          router.replace("/dashboard");
        }
      }
    },
    [supabase, fetchUserProfile, router]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, loading: false, error: null });
    router.replace("/login");
  }, [supabase, router]);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
