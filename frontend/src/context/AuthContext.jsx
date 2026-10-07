import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('shopsphere_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('shopsphere_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Restore session & verify token validity
  const getCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('shopsphere_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await authService.getMe();
      if (response && response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('shopsphere_user', JSON.stringify(response.data));
        return response.data;
      }
    } catch {
      // If token expired or invalid, log out
      localStorage.removeItem('shopsphere_token');
      localStorage.removeItem('shopsphere_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser();

    // Listen for unauthorized 401 events from Axios interceptor
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [getCurrentUser]);

  // Login handler
  const login = async (email, password, otp) => {
    const response = await authService.login({ email, password, otp });
    if (response.requireOtp) {
      return response;
    }
    if (response.success && response.data?.token) {
      const authToken = response.data.token;
      const userData = response.data.user || response.data;
      localStorage.setItem('shopsphere_token', authToken);
      localStorage.setItem('shopsphere_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.message || 'Login failed');
  };

  // Verify Login OTP handler
  const verifyLoginOtp = async (email, otp) => {
    const response = await authService.verifyLoginOtp(email, otp);
    if (response.success && response.data?.token) {
      const authToken = response.data.token;
      const userData = response.data.user || response.data;
      localStorage.setItem('shopsphere_token', authToken);
      localStorage.setItem('shopsphere_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.message || 'OTP verification failed');
  };

  // Register handler
  const register = async (formData) => {
    const response = await authService.register(formData);
    if (response.success && response.data?.token) {
      const authToken = response.data.token;
      const userData = response.data.user || response.data;
      localStorage.setItem('shopsphere_token', authToken);
      localStorage.setItem('shopsphere_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.message || 'Registration failed');
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('shopsphere_token');
      localStorage.removeItem('shopsphere_user');
      setToken(null);
      setUser(null);
    }
  };

  // Update user state locally when profile changes
  const updateUserState = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('shopsphere_user', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    verifyLoginOtp,
    register,
    logout,
    getCurrentUser,
    updateUserState,
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

export default AuthContext;
