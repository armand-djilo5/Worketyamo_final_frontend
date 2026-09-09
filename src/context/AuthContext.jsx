import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/env";

const AuthContext = createContext(null);

const STORAGE_KEY = "worketyamo_admin_session";

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  // POST /api/admin/login
  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/admin/login`, {
      email,
      password,
    });
    const { token, refreshToken, admin } = response.data;
    setSession({ token, refreshToken, admin });
    return response.data;
  }, []);

  // POST /api/admin/signup
  const signup = useCallback(async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/admin/signup`, payload);
    return response.data;
  }, []);

  // POST /api/admin/logout
  const logout = useCallback(async () => {
    const refreshToken = session?.refreshToken;
    setSession(null);
    if (refreshToken) {
      try {
        await axios.post(`${API_BASE_URL}/admin/logout`, { refreshToken });
      } catch {
        // Session is cleared locally regardless of server response.
      }
    }
  }, [session]);

  // POST /api/admin/refresh — exchanges the refresh token for a new access token
  const refreshAccessToken = useCallback(async () => {
    if (!session?.refreshToken) throw new Error("No refresh token available");
    setInitializing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/refresh`, {
        refreshToken: session.refreshToken,
      });
      const newToken = response.data.accessToken;
      setSession((prev) => (prev ? { ...prev, token: newToken } : prev));
      return newToken;
    } catch (error) {
      setSession(null);
      throw error;
    } finally {
      setInitializing(false);
    }
  }, [session]);

  const value = useMemo(
    () => ({
      admin: session?.admin ?? null,
      token: session?.token ?? null,
      refreshToken: session?.refreshToken ?? null,
      isAuthenticated: Boolean(session?.token),
      initializing,
      login,
      signup,
      logout,
      refreshAccessToken,
    }),
    [session, initializing, login, signup, logout, refreshAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
