// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { AUTH_STORAGE_KEY } from "../utils/constants";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ─── DEVELOPMENT: reset auth setiap load ──
    if (import.meta.env.DEV) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setLoading(false);
      return;
    }

    // ─── PRODUCTION: ambil dari localStorage ──
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    if (username === "admin" && password === "admin123") {
      const userData = { username, name: "Administrator", role: "admin" };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    if (username === "guest" && password === "guest123") {
      const userData = { username, name: "Guest", role: "guest" };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
