import { useCallback, useEffect, useState } from "react";
import { authService } from "../services/auth-service";

interface AuthUser {
  id: string;
}

/**
 * Decodes the JWT payload without a signature check — this only reads the
 * `sub` claim for display purposes. The backend is the sole source of truth
 * for whether the token is actually valid.
 */
function decodeUserFromToken(token: string): AuthUser | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json);
    return parsed.sub ? { id: parsed.sub } : null;
  } catch {
    return null;
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const token = authService.getToken();
    setUser(token ? decodeUserFromToken(token) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [refresh]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return { user, loading, isAuthenticated: !!user, logout, refresh };
};
