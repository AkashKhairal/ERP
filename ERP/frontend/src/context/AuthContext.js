import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      if (response.success) {
        const { user: userData, token } = response.data;
        setUser(userData);
        localStorage.setItem('token', token);
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      if (response.success) {
        const { user: newUser, token } = response.data;
        setUser(newUser);
        localStorage.setItem('token', token);
        return { success: true };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Profile update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError('Profile update failed. Please try again.');
      return { success: false, message: 'Profile update failed. Please try again.' };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setError(null);
      const response = await authService.changePassword(passwordData);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Password change failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError('Password change failed. Please try again.');
      return { success: false, message: 'Password change failed. Please try again.' };
    }
  };

  const googleSignIn = async (googleToken) => {
    try {
      setError(null);
      const response = await authService.googleSignIn(googleToken);
      if (response.success) {
        const { user: userData, token } = response.data;
        setUser(userData);
        localStorage.setItem('token', token);
        return { success: true };
      } else {
        setError(response.message || 'Google sign-in failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError('Google sign-in failed. Please try again.');
      return { success: false, message: 'Google sign-in failed. Please try again.' };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    googleSignIn,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 