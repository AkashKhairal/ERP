import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/roles`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface Role {
  _id?: string
  name: string
  description: string
  permissions: Permission[]
  isDefault?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Permission {
  module: string
  actions: string[]
}

export const roleService = {
  // Get all roles
  getRoles: async (params = {}): Promise<{ success: boolean; data: Role[] }> => {
    try {
      const response = await api.get('/', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching roles:', error)
      return { success: false, data: [] }
    }
  },

  // Get role by ID
  getRoleById: async (id: string): Promise<{ success: boolean; data: Role }> => {
    try {
      const response = await api.get(`/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching role:', error)
      return { success: false, data: {} as Role }
    }
  },

  // Create new role
  createRole: async (roleData: Partial<Role>): Promise<{ success: boolean; data: Role }> => {
    try {
      const response = await api.post('/', roleData)
      return response.data
    } catch (error) {
      console.error('Error creating role:', error)
      return { success: false, data: {} as Role }
    }
  },

  // Update role
  updateRole: async (id: string, roleData: Partial<Role>): Promise<{ success: boolean; data: Role }> => {
    try {
      const response = await api.put(`/${id}`, roleData)
      return response.data
    } catch (error) {
      console.error('Error updating role:', error)
      return { success: false, data: {} as Role }
    }
  },

  // Delete role
  deleteRole: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting role:', error)
      return { success: false, message: 'Failed to delete role' }
    }
  },

  // Get default roles
  getDefaultRoles: async (): Promise<{ success: boolean; data: Role[] }> => {
    try {
      const response = await api.get('/default')
      return response.data
    } catch (error) {
      console.error('Error fetching default roles:', error)
      return { success: false, data: [] }
    }
  },

  // Initialize default roles
  initializeDefaultRoles: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/initialize')
      return response.data
    } catch (error) {
      console.error('Error initializing default roles:', error)
      return { success: false, message: 'Failed to initialize default roles' }
    }
  },

  // Get available modules and actions
  getAvailableModules: (): string[] => {
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
    ]
  },

  // Get available actions
  getAvailableActions: (): string[] => {
    return [
      'create',
      'read',
      'update',
      'delete',
      'approve',
      'export'
    ]
  },

  // Get module descriptions
  getModuleDescriptions: (): Record<string, string> => {
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
    }
  },

  // Get action descriptions
  getActionDescriptions: (): Record<string, string> => {
    return {
      create: 'Can create new records',
      read: 'Can view existing records',
      update: 'Can modify existing records',
      delete: 'Can remove records',
      approve: 'Can approve requests and changes',
      export: 'Can export data to files'
    }
  }
}

export default roleService 