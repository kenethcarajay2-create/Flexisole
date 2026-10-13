
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

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

      setToken(data.token);
      setAdmin(data.user);

      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      token,
      loading,
      isAuthenticated: Boolean(admin && token),
      login,
      logout,
    }),
    [admin, token, loading, login, logout]
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
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
    