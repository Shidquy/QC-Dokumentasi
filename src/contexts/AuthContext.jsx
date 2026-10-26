// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AUTH_STORAGE_KEY } from '../utils/constants';
import { API_BASE_URL } from '../utils/api';

const AuthContext = createContext();
const TOKEN_KEY = 'qc_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

      if (token) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.success && res.data.data) {
            setUser(res.data.data);
            setLoading(false);
            return;
          }
        } catch {
          // Token expired or server unreachable
        }
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password,
      });

      if (res.data?.success && res.data.data) {
        const { token, user: loggedUser } = res.data.data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
        setUser(loggedUser);
        return { success: true };
      }
    } catch (err) {
      // Jika server merespon dengan error 400/401 (kredensial salah)
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        return {
          success: false,
          error: err.response.data?.error || 'Username atau password salah!',
        };
      }
      console.warn('API backend tidak merespons, mencoba fallback kredensial lokal:', err.message);
    }

    // Fallback offline credentials (jika backend tidak aktif/terkoneksi)
    if (username === 'admin' && password === 'admin123') {
      const userData = { username, name: 'Administrator', role: 'admin' };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    if (username === 'guest' && password === 'guest123') {
      const userData = { username, name: 'Guest', role: 'guest' };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return {
      success: false,
      error: 'Username atau password salah!',
    };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
