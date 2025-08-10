import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname.includes('ngrok') 
    ? 'https://17c799031c92.ngrok-free.app/api'  // Your ngrok backend URL
    : 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/roles`,
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

export const roleService = {
  // Get all roles
  getRoles: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get role by ID
  getRoleById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Create new role
  createRole: async (roleData) => {
    const response = await api.post('/', roleData);
    return response.data;
  },

  // Update role
  updateRole: async (id, roleData) => {
    const response = await api.put(`/${id}`, roleData);
    return response.data;
  },

  // Delete role
  deleteRole: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // Get default roles
  getDefaultRoles: async () => {
    const response = await api.get('/default');
    return response.data;
  },

  // Initialize default roles
  initializeDefaultRoles: async () => {
    const response = await api.post('/initialize');
    return response.data;
  },

  // Get available modules and actions
  getAvailableModules: () => {
    return [
      'users',
      'teams', 
      'employees',
      'attendance',
      'leaves',
      'payroll',
      'projects',
      'tasks',
      'sprints',
      'finance',
      'analytics',
      'content',
      'integrations'
    ];
  },

  // Get available actions
  getAvailableActions: () => {
    return [
      'create',
      'read',
      'update',
      'delete',
      'approve',
      'export'
    ];
  },

  // Get module descriptions
  getModuleDescriptions: () => {
    return {
      users: 'User Management - Create, view, edit, and delete user accounts',
      teams: 'Team Management - Manage team structures and assignments',
      employees: 'Employee Management - HR employee data and profiles',
      attendance: 'Attendance Tracking - Daily check-ins and time tracking',
      leaves: 'Leave Management - Request and approve time off',
      payroll: 'Payroll Management - Salary and compensation data',
      projects: 'Project Management - Create and manage projects',
      tasks: 'Task Management - Assign and track individual tasks',
      sprints: 'Sprint Management - Agile development sprints',
      finance: 'Finance Management - Budget, expenses, and revenue',
      analytics: 'Analytics & Reporting - Data insights and reports',
      content: 'Content Management - YouTube and course content',
      integrations: 'Integrations - Third-party service connections'
    };
  },

  // Get action descriptions
  getActionDescriptions: () => {
    return {
      create: 'Can create new records',
      read: 'Can view existing records',
      update: 'Can modify existing records',
      delete: 'Can remove records',
      approve: 'Can approve requests and changes',
      export: 'Can export data to files'
    };
  }
};

export default roleService; 