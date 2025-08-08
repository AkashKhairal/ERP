import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/users`,
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

export interface User {
  _id?: string
  firstName: string
  lastName: string
  email: string
  password?: string
  roles?: Array<{
    _id: string
    name: string
    description?: string
  }>
  department: 'engineering' | 'content' | 'marketing' | 'finance' | 'hr' | 'operations'
  position?: string
  avatar?: string | null
  phone?: string
  dateOfBirth?: string
  hireDate?: string
  isActive?: boolean
  lastLogin?: string
  customPermissions?: Array<{
    module: string
    actions: string[]
  }>
  preferences?: {
    theme?: 'light' | 'dark' | 'auto'
    notifications?: {
      email?: boolean
      push?: boolean
      slack?: boolean
    }
    timezone?: string
  }
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
    youtube?: string
  }
  emergencyContact?: {
    name?: string
    relationship?: string
    phone?: string
    email?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface UserFilters {
  search?: string
  department?: string
  isActive?: boolean
  role?: string
  page?: number
  limit?: number
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  byDepartment: Record<string, number>
  byRole: Record<string, number>
}

export const userService = {
  // Get all users
  getUsers: async (filters: UserFilters = {}): Promise<{ success: boolean; data: User[]; pagination?: any }> => {
    try {
      const response = await api.get('/', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Error fetching users:', error)
      return { success: false, data: [] }
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<{ success: boolean; data: User }> => {
    try {
      const response = await api.get(`/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching user:', error)
      return { success: false, data: {} as User }
    }
  },

  // Create new user
  createUser: async (userData: Partial<User>): Promise<{ success: boolean; data: User; message?: string }> => {
    try {
      const response = await api.post('/', userData)
      return response.data
    } catch (error: any) {
      console.error('Error creating user:', error)
      return { 
        success: false, 
        data: {} as User,
        message: error.response?.data?.message || 'Failed to create user'
      }
    }
  },

  // Update user
  updateUser: async (id: string, userData: Partial<User>): Promise<{ success: boolean; data: User; message?: string }> => {
    try {
      const response = await api.put(`/${id}`, userData)
      return response.data
    } catch (error: any) {
      console.error('Error updating user:', error)
      return { 
        success: false, 
        data: {} as User,
        message: error.response?.data?.message || 'Failed to update user'
      }
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error deleting user:', error)
      return { success: false, message: 'Failed to delete user' }
    }
  },

  // Assign roles to user
  assignRoles: async (userId: string, roleIds: string[]): Promise<{ success: boolean; data: User; message?: string }> => {
    try {
      const response = await api.post(`/${userId}/roles`, { roles: roleIds })
      return response.data
    } catch (error: any) {
      console.error('Error assigning roles:', error)
      return { 
        success: false, 
        data: {} as User,
        message: error.response?.data?.message || 'Failed to assign roles'
      }
    }
  },

  // Get user permissions
  getUserPermissions: async (userId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await api.get(`/${userId}/permissions`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching user permissions:', error)
      return { success: false, data: {} }
    }
  },

  // Export users
  exportUsers: async (filters: UserFilters = {}): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await api.get('/export', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Error exporting users:', error)
      return { success: false, data: null }
    }
  },

  // Get user statistics
  getUserStats: async (): Promise<{ success: boolean; data: UserStats }> => {
    try {
      const response = await api.get('/stats')
      return response.data
    } catch (error: any) {
      console.error('Error fetching user stats:', error)
      return { 
        success: false, 
        data: {
          total: 0,
          active: 0,
          inactive: 0,
          byDepartment: {},
          byRole: {}
        }
      }
    }
  },

  // Sample data for fallback
  getSampleUsers: (): User[] => {
    return [
      {
        _id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        department: 'engineering',
        position: 'Senior Software Engineer',
        isActive: true,
        phone: '+1 (555) 123-4567',
        hireDate: '2023-01-15',
        lastLogin: '2024-01-15T10:30:00Z',
        roles: [{ _id: '1', name: 'Employee' }]
      },
      {
        _id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        department: 'marketing',
        position: 'Marketing Manager',
        isActive: true,
        phone: '+1 (555) 234-5678',
        hireDate: '2023-02-01',
        lastLogin: '2024-01-14T15:45:00Z',
        roles: [{ _id: '2', name: 'Manager' }]
      },
      {
        _id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@company.com',
        department: 'sales',
        position: 'Sales Representative',
        isActive: false,
        phone: '+1 (555) 345-6789',
        hireDate: '2023-03-10',
        lastLogin: '2024-01-10T09:15:00Z',
        roles: [{ _id: '1', name: 'Employee' }]
      },
      {
        _id: '4',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        department: 'design',
        position: 'Design Lead',
        isActive: true,
        phone: '+1 (555) 456-7890',
        hireDate: '2023-04-05',
        lastLogin: '2024-01-15T14:20:00Z',
        roles: [{ _id: '2', name: 'Manager' }]
      },
      {
        _id: '5',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@company.com',
        department: 'engineering',
        position: 'Frontend Developer',
        isActive: true,
        phone: '+1 (555) 567-8901',
        hireDate: '2023-05-20',
        lastLogin: '2024-01-15T11:20:00Z',
        roles: [{ _id: '1', name: 'Employee' }]
      },
      {
        _id: '6',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@company.com',
        department: 'hr',
        position: 'HR Specialist',
        isActive: true,
        phone: '+1 (555) 678-9012',
        hireDate: '2023-06-12',
        lastLogin: '2024-01-14T16:30:00Z',
        roles: [{ _id: '1', name: 'Employee' }]
      },
      {
        _id: '7',
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@company.com',
        department: 'finance',
        position: 'Financial Analyst',
        isActive: true,
        phone: '+1 (555) 789-0123',
        hireDate: '2023-07-08',
        lastLogin: '2024-01-15T09:45:00Z',
        roles: [{ _id: '1', name: 'Employee' }]
      },
      {
        _id: '8',
        firstName: 'Lisa',
        lastName: 'Garcia',
        email: 'lisa.garcia@company.com',
        department: 'content',
        position: 'Content Creator',
        isActive: true,
        phone: '+1 (555) 890-1234',
        hireDate: '2023-08-15',
        lastLogin: '2024-01-15T13:15:00Z',
        roles: [{ _id: '1', name: 'Employee' }]
      },
      {
        _id: '9',
        firstName: 'James',
        lastName: 'Taylor',
        email: 'james.taylor@company.com',
        department: 'operations',
        position: 'Operations Manager',
        isActive: true,
        phone: '+1 (555) 901-2345',
        hireDate: '2023-09-22',
        lastLogin: '2024-01-14T17:00:00Z',
        roles: [{ _id: '2', name: 'Manager' }]
      },
      {
        _id: '10',
        firstName: 'Amanda',
        lastName: 'Anderson',
        email: 'amanda.anderson@company.com',
        department: 'engineering',
        position: 'Backend Developer',
        isActive: true,
        phone: '+1 (555) 012-3456',
        hireDate: '2023-10-30',
        lastLogin: '2024-01-15T08:30:00Z',
        roles: [{ _id: '1', name: 'Employee' }]
      }
    ]
  }
} 