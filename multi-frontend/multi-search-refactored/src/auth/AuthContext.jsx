import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getUserInfo, signin } from "../api/authApi.js";

const TOKEN_KEY = "shoppingToken";
const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
}

function normalizeMenu(menu) {
  const raw = typeof menu === "string" ? menu : menu?.menu ?? "";
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function canOpenCustomerTable(user) {
  const role = Number(user?.role);
  const menuKeys = (user?.menus ?? []).map(normalizeMenu);
  return role > 1 || menuKeys.some((key) => (
    key.includes("user") ||
    key.includes("customer") ||
    key.includes("admin") ||
    key.includes("seller")
  ));
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const loadUser = useCallback(async (activeToken) => {
    const claims = decodeJwt(activeToken);
    const info = await getUserInfo(activeToken);
    if (info.code !== 200) {
      throw new Error(info.message ?? "Unable to load account access");
    }
    setUser({
      fullname: info.fullname,
      role: claims.role,
      id: claims.crid ?? info.id,
      username: claims.username,
      menus: info.menuList ?? [],
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await loadUser(token);
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, [loadUser, token]);

  const login = useCallback(async ({ username, password }) => {
    const data = await signin({ username, password });
    if (data.code !== 200) {
      throw new Error(data.message ?? "Invalid email or password");
    }

    localStorage.setItem(TOKEN_KEY, data.jwt);
    setToken(data.jwt);
    await loadUser(data.jwt);
  }, [loadUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    canManageCustomers: canOpenCustomerTable(user),
    canUseCart: Number(user?.role) === 1,
    login,
    logout,
  }), [loading, login, logout, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
