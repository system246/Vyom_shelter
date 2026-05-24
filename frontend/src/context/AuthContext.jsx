import { createContext, useContext, useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_URL || '/api';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ap_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => setUser(d.user))
        .catch(() => { localStorage.removeItem('ap_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res  = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('ap_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Re-fetch user from /auth/me to get latest data (e.g. after form submit)
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem('ap_token');
    setToken(null);
    setUser(null);
  };

  const authFetch = (url, opts = {}) =>
    fetch(url, { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${token}` } });

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
