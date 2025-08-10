import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname.includes('ngrok') 
    ? 'https://17c799031c92.ngrok-free.app/api'  // Your ngrok backend URL
    : 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/audit`,
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

export const auditService = {
  // Get audit logs
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get audit log by ID
  getAuditLogById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Get audit logs for a specific user
  getAuditLogsByUser: async (userId, params = {}) => {
    const response = await api.get(`/user/${userId}`, { params });
    return response.data;
  },

  // Get audit statistics
  getAuditStats: async (params = {}) => {
    const response = await api.get('/stats', { params });
    return response.data;
  },

  // Export audit logs
  exportAuditLogs: async (params = {}) => {
    const response = await api.get('/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Get available actions for filtering
  getAvailableActions: () => {
    return [
      'login',
      'logout', 
      'login_failed',
      'permission_granted',
      'permission_revoked',
      'role_assigned',
      'role_removed',
      'user_created',
      'user_updated',
      'user_deleted',
      'user_deactivated',
      'role_created',
      'role_updated',
      'role_deleted',
      'access_denied',
      'unauthorized_access_attempt',
      'data_exported',
      'data_imported',
      'password_changed',
      'profile_updated'
    ];
  },

  // Get available resources for filtering
  getAvailableResources: () => {
    return [
      'user',
      'role',
      'permission',
      'module',
      'system'
    ];
  },

  // Get action descriptions
  getActionDescriptions: () => {
    return {
      login: 'User logged in successfully',
      logout: 'User logged out',
      login_failed: 'Failed login attempt',
      permission_granted: 'Permission was granted to user',
      permission_revoked: 'Permission was revoked from user',
      role_assigned: 'Role was assigned to user',
      role_removed: 'Role was removed from user',
      user_created: 'New user account was created',
      user_updated: 'User profile was updated',
      user_deleted: 'User account was deleted',
      user_deactivated: 'User account was deactivated',
      role_created: 'New role was created',
      role_updated: 'Role was updated',
      role_deleted: 'Role was deleted',
      access_denied: 'Access was denied to a resource',
      unauthorized_access_attempt: 'Unauthorized access attempt detected',
      data_exported: 'Data was exported from system',
      data_imported: 'Data was imported into system',
      password_changed: 'User password was changed',
      profile_updated: 'User profile was updated'
    };
  },

  // Get resource descriptions
  getResourceDescriptions: () => {
    return {
      user: 'User account or profile',
      role: 'Role definition or assignment',
      permission: 'Permission settings',
      module: 'System module access',
      system: 'System-level operations'
    };
  },

  // Format timestamp for display
  formatTimestamp: (timestamp) => {
    return new Date(timestamp).toLocaleString();
  },

  // Get status color for success/failure
  getStatusColor: (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  },

  // Get status icon for success/failure
  getStatusIcon: (success) => {
    return success ? '✓' : '✗';
  }
};

export default auditService; 