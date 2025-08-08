import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname.includes('ngrok') 
    ? 'https://17c799031c92.ngrok-free.app/api'  // Your ngrok backend URL
    : 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only logout if it's a real authentication error, not just missing data
      if (error.response?.data?.message?.includes('token') || 
          error.response?.data?.message?.includes('authorized')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  },

  // Google Sign-In
  googleSignIn: async (token) => {
    const response = await api.post('/auth/google', { token });
    return response;
  },
};

export default authService; 