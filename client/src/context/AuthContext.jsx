import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on app load
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        setUser(res.data);
        return { success: true, user: res.data };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Register handler
  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success && res.data) {
        setUser(res.data);
        return { success: true, user: res.data };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request completed with notice:', err.message);
    } finally {
      setUser(null);
    }
  };

  // Update local user state
  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    authError,
    login,
    register,
    logout,
    updateUserState,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
