
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "flexisole_admin_token";

function getSavedToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveToken(token) {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    console.warn("Unable to save admin session.");
  }
}

function removeSavedToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn("Unable to clear saved admin session.");
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getSavedToken);
  const [admin, setAdmin] = useState(null);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(
    () => Boolean(getSavedToken())
  );

  // Restore and verify the login after a page refresh.
  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;

    async function verifySession() {
      setCheckingSession(true);

      try {
        const data = await apiRequest("/auth/admin/me", {
          token,
        });

        if (cancelled) return;

        if (data.user?.role !== "admin") {
          throw new Error("Invalid admin session.");
        }

        setAdmin(data.user);
      } catch (error) {
        if (cancelled) return;

        console.warn("Admin session verification failed:", error);

        setAdmin(null);
        setToken(null);
        removeSavedToken();
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);

    try {
      const data = await apiRequest("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!data.token || data.user?.role !== "admin") {
        throw new Error("Invalid administrator session.");
      }

      saveToken(data.token);

      setAdmin(data.user);
      setToken(data.token);

      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeSavedToken();
    setAdmin(null);
    setToken(null);
    setCheckingSession(false);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      token,
      loading,
      checkingSession,
      isAuthenticated: Boolean(admin && token),
      login,
      logout,
    }),
    [
      admin,
      token,
      loading,
      checkingSession,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
