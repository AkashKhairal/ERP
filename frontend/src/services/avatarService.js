import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add request interceptor to include auth token
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

export const avatarService = {
  // Upload avatar image
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/auth/upload-avatar', formData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Remove avatar
  async removeAvatar() {
    try {
      const response = await api.delete('/auth/remove-avatar');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Handle API errors
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'Avatar upload failed';
      const status = error.response.status;
      
      return {
        message,
        status,
        data: error.response.data
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
};
