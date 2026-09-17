import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { usePlayer } from './PlayerContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { resetPlayer } = usePlayer();

  useEffect(() => {
    const token = localStorage.getItem('geesphere_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('geesphere_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('geesphere_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (full_name, email, password) => {
    const res = await api.post('/auth/register', { full_name, email, password });
    if (res.data.success) {
      localStorage.setItem('geesphere_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('geesphere_token');
    setUser(null);
    if (resetPlayer) resetPlayer();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
