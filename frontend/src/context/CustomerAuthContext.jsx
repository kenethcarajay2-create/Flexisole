
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CustomerAuthContext = createContext(null);

const TOKEN_KEY = "flexisole_customer_token";
const USER_KEY = "flexisole_customer_user";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api")
).replace(/\/$/, "");

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearSessionStorage() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Browser storage may be unavailable.
  }
}

export function CustomerAuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [customer, setCustomer] = useState(null);
  const [checkingSession, setCheckingSession] = useState(
    () => Boolean(readToken())
  );
  const [signingIn, setSigningIn] = useState(false);

  const logout = useCallback(() => {
    clearSessionStorage();
    setCustomer(null);
    setToken(null);
    setCheckingSession(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setCustomer(null);
      setCheckingSession(false);
      return;
    }

    const controller = new AbortController();

    async function restoreSession() {
      setCheckingSession(true);

      try {
        const response = await fetch(
          `${API_URL}/auth/customer/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (
          !response.ok ||
          data.user?.role !== "customer"
        ) {
          throw new Error(
            data.message || "Your customer session has expired."
          );
        }

        if (!controller.signal.aborted) {
          setCustomer(data.user);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        // Network errors may be temporary; don't discard
        // a potentially valid token just because the API
        // cannot be reached.
        if (
          error instanceof TypeError &&
          error.message.includes("fetch")
        ) {
          setCustomer(null);
        } else {
          clearSessionStorage();
          setToken(null);
          setCustomer(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => controller.abort();
  }, [token]);

  const loginWithGoogle = useCallback(async (credential) => {
    setSigningIn(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/customer/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Unable to read the server response. Please try again."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Google Sign-In failed."
        );
      }

      if (
        !data.token ||
        !data.user ||
        data.user.role !== "customer"
      ) {
        throw new Error("Invalid customer account response.");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user)
      );

      setCustomer(data.user);
      setToken(data.token);

      return data.user;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      customer,
      token,
      checkingSession,
      signingIn,
      isAuthenticated: Boolean(customer && token),
      loginWithGoogle,
      logout,
    }),
    [
      customer,
      token,
      checkingSession,
      signingIn,
      loginWithGoogle,
      logout,
    ]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error(
      "useCustomerAuth must be used inside CustomerAuthProvider."
    );
  }

  return context;
}
