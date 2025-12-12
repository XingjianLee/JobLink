import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

type UserRole = "jobseeker" | "company" | "admin" | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
        }));

        // Defer role fetching to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, role: null, loading: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      }));

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      setAuthState(prev => ({
        ...prev,
        role: (roleData?.role as UserRole) || "jobseeker",
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching user role:", error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      session: null,
      role: null,
      loading: false,
      isAuthenticated: false,
    });
  };

  const getDashboardPath = () => {
    switch (authState.role) {
      case "company":
        return "/company/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/jobseeker/dashboard";
    }
  };

  return {
    ...authState,
    signOut,
    getDashboardPath,
  };
}

// Hook for protected routes - redirects to auth if not logged in
export function useRequireAuth(requiredRole?: UserRole) {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.isAuthenticated) {
      navigate("/auth/jobseeker");
      return;
    }

    // Check role if required
    if (requiredRole && auth.role !== requiredRole) {
      // Redirect to appropriate dashboard
      navigate(auth.getDashboardPath());
    }
  }, [auth.loading, auth.isAuthenticated, auth.role, requiredRole, navigate]);

  return auth;
}

// Hook for redirecting authenticated users away from public pages
export function useRedirectIfAuthenticated() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) return;

    if (auth.isAuthenticated && auth.role) {
      navigate(auth.getDashboardPath());
    }
  }, [auth.loading, auth.isAuthenticated, auth.role, navigate]);

  return auth;
}
