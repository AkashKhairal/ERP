import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await authService.getMe();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.data.user,
              token
            }
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(email, password);
      
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      toast.success('Login successful!');
      navigate('/app/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      toast.success('Registration successful!');
      navigate('/app/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Google Sign-In function
  const googleSignIn = async (token) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.googleSignIn(token);
      
      const { user, token: jwtToken, googleInfo } = response.data.data;
      localStorage.setItem('token', jwtToken);
      
      // Store Google info if available
      if (googleInfo) {
        localStorage.setItem('googleInfo', JSON.stringify(googleInfo));
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: jwtToken, googleInfo }
      });
      
      toast.success('Google Sign-In successful!');
      navigate('/app/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Google Sign-In failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data.user
      });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Activity tracking function
  const logActivity = (action, details) => {
    const activity = {
      id: Date.now(),
      user: state.user?.firstName + ' ' + state.user?.lastName,
      userEmail: state.user?.email,
      action,
      details,
      timestamp: new Date().toISOString(),
      module: getCurrentModule()
    };

    // Store in localStorage for now (in production, send to backend)
    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    activities.unshift(activity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(100);
    }
    
    localStorage.setItem('userActivities', JSON.stringify(activities));
  };

  const getCurrentModule = () => {
    const path = window.location.pathname;
    if (path.includes('/hr')) return 'HR Management';
    if (path.includes('/users')) return 'Users';
    if (path.includes('/teams')) return 'Teams';
    if (path.includes('/projects')) return 'Projects';
    if (path.includes('/tasks')) return 'Tasks';
    if (path.includes('/finance')) return 'Finance';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/content')) return 'Content';
    return 'Dashboard';
  };

  const getRecentActivities = () => {
    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    return activities.slice(0, 10); // Return last 10 activities
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    googleSignIn,
    logout,
    updateProfile,
    changePassword,
    clearError,
    logActivity,
    getRecentActivities
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 